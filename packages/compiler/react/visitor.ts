import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import { createDeopt, resolveCorrectImportSource, resolvePath } from './utils';
import { transformComponent } from './transform';
import { collectImportedBindings } from './bindings';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const visitor = (options: Options = {}, isReact = true) => {
  return (callSitePath: NodePath<t.CallExpression>) => {
    // Callsite refers to the block call (e.g. the AST node of "block(Componnent)")
    const callSite = callSitePath.node;

    // We assume that two parent paths up is the top level path, since the we also
    // assume the block call is on the global scope path.
    const globalPath = callSitePath.parentPath.parentPath!;

    // We only want to optimize block calls.
    // check if the block is aliased (e.g. import { block as createBlock } ...)
    const programPath = callSitePath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;
    const importedBlocks = collectImportedBindings(programPath);
    if (
      !t.isIdentifier(callSite.callee) ||
      !importedBlocks[callSite.callee.name]
    )
      return;

    // Allow the user to opt into experimental optimization by adding a /* @optimize */
    // to the block call.
    if (
      callSite.leadingComments?.some(
        (comment) => comment.value.trim() === '@optimize',
      )
    ) {
      options.optimize = true;
    }

    /**
     * It's possible that the block call is in a scope we don't have access to.
     * This is when we can't access the import specifier for the block function.
     *
     * import { block } from 'million/react';
     *          ^ could not find this
     */
    const blockCallBinding = callSitePath.scope.getBinding(
      callSite.callee.name,
    ); // callee.name = 'block'
    if (!blockCallBinding) {
      /**
       * Deoptimization errors are thrown when the compiler is unable to optimize the code.
       * They are catched globally and logged as warnings, but the code is not compiled.
       * This is to prevent the compiler from generating invalid code.
       */
      throw createDeopt(
        'Unable to find AST binding for block. Check that the block function is imported correctly.',
        callSitePath,
      );
    }

    const importDeclaration = blockCallBinding.path.parent;

    /**
     * Here we just check if the import declaration is using the correct package
     * in case another library exports a function called "block".
     */
    if (
      !t.isImportDeclaration(importDeclaration) ||
      !importDeclaration.source.value.includes('million') ||
      !importDeclaration.specifiers.some(
        (specifier) =>
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          specifier.imported.name === 'block' &&
          importedBlocks['block'] === specifier.local.name,
      )
    ) {
      const millionImportDeclarationPath = blockCallBinding.path.parentPath!;
      throw createDeopt(
        'Found unsupported import for block. Make sure blocks are imported from correctly.',
        millionImportDeclarationPath,
      );
    }

    const importSource = importDeclaration.source;
    /**
     * There are different imports based on the library (e.g. million/react, million/preact, etc.)
     * and usage context (e.g. million/react-server, million/preact-server, etc.). Based on user
     * provided options, we resolve the correct import source.
     */
    importSource.value = resolveCorrectImportSource(
      options,
      importSource.value,
    );

    const RawComponent = callSite.arguments[0];

    /**
     * Normally, we assume the Component to be a identifier (e.g. block(Component)) that
     * references a function. However, it's possible that the user passes an anonymous
     * function (e.g. block(() => <div />)). In this case, we need to hoist the function
     * declaration to the top of the scope and replace the anonymous function with the
     * identifier of the hoisted function.
     *
     * ```js
     * block(() => <div />)
     *
     * // becomes
     *
     * const anonymous = () => <div />;
     *
     * block(anonymous)
     * ```
     */
    const isComponentAnonymous =
      t.isFunctionExpression(RawComponent) ||
      t.isArrowFunctionExpression(RawComponent);

    if (isComponentAnonymous) {
      const anonymousComponentId =
        callSitePath.scope.generateUidIdentifier('anonymous$');

      /**
       * const anonymous = () => <div />;
       */
      globalPath.insertBefore(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            anonymousComponentId,
            t.arrowFunctionExpression(RawComponent.params, RawComponent.body),
          ),
        ]),
      );

      /**
       * Replaces function expression with identifier
       * `block(() => ...)` to `block(anonymous)`
       */
      callSite.arguments[0] = anonymousComponentId;
    }

    /**
     * We assume that the component is a identifier (e.g. block(Component)). If `isComponentAnonymous`
     * is true, then we know that it has been replaced with a identifier.
     */
    if (!t.isIdentifier(RawComponent)) {
      throw createDeopt(
        'Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.',
        callSitePath,
      );
    }

    const componentDeclarationPath = isComponentAnonymous
      ? // we just inserted the anonymous function declaration, so we know it's the previous sibling
        globalPath.getPrevSibling()
      : callSitePath.scope.getBinding(RawComponent.name)!.path;

    // We want to keep the original component declaration intact, so we clone it.
    const Component = t.cloneNode(componentDeclarationPath.node) as
      | t.VariableDeclarator
      | t.FunctionDeclaration;

    const SHARED = {
      callSitePath,
      callSite,
      Component,
      importSource,
      globalPath,
      isReact,
      imports: {
        cache: new Map<string, t.Identifier>(),
        addNamed(
          name: string,
          source: string = importSource.value,
          forceClient?: boolean,
        ) {
          if (this.cache.has(name)) return this.cache.get(name)!;

          if (forceClient) {
            source = source.replace('-server', '');
          }

          const id = addNamed(callSitePath, name, source, {
            nameHint: `${name}$`,
          });
          this.cache.set(name, id);
          return id;
        },
      },
    };

    if (
      t.isVariableDeclarator(Component) &&
      t.isArrowFunctionExpression(Component.init)
    ) {
      /*
       * Variable Declaration w/ Arrow Function:
       *
       * ```js
       * const Component = () => {
       *  return <div />;
       * }
       *  ```
       */
      transformComponent(
        options,
        {
          componentBody: Component.init.body as t.BlockStatement,
          componentBodyPath: resolvePath(
            componentDeclarationPath.get('init.body'),
          ),
        },
        SHARED,
      );
    } else if (t.isFunctionDeclaration(Component)) {
      /**
       * Function Declaration:
       *
       * ```js
       * function Component() {
       *  return <div />;
       * }
       * ```
       */
      transformComponent(
        options,
        {
          componentBody: Component.body,
          componentBodyPath: resolvePath(componentDeclarationPath.get('body')),
        },
        SHARED,
      );
    } else {
      throw createDeopt(
        'You can only use block() with a function declaration or arrow function.',
        callSitePath,
      );
    }
  };
};
