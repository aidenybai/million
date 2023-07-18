import * as t from '@babel/types';
import {
  addNamedCache,
  getValidSpecifiers,
  createDeopt,
  resolveCorrectImportSource,
  resolvePath,
  TRANSFORM_ANNOTATION,
} from './utils';
import { transformComponent } from './transform';
import { collectImportedBindings } from './bindings';
import { evaluate } from './evaluator';
import type { Shared } from './types';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const callExpressionVisitor = (
  options: Options = {},
  isReact = true,
  unstable = false,
) => {
  return (
    callSitePath: NodePath<t.CallExpression>,
    blockCache: Map<string, t.Identifier>,
  ) => {
    // Callsite refers to the block call (e.g. the AST node of "block(Componnent)")
    const callSite = callSitePath.node;
    if (
      callSite.leadingComments?.some((comment) =>
        comment.value.startsWith(TRANSFORM_ANNOTATION),
      )
    )
      return;

    // We assume that two parent paths up is the top level path, since the we also
    // assume the block call is on the global scope path.
    const variableDeclarationPath = callSitePath.parentPath.parentPath!;

    // We only want to optimize block calls.
    // check if the block is aliased (e.g. import { block as createBlock } ...)
    const programPath = callSitePath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;
    const importedBindings = collectImportedBindings(programPath);

    if (
      !t.isIdentifier(callSite.callee) ||
      !importedBindings[callSite.callee.name]
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

    const importDeclarationPath = blockCallBinding.path
      .parentPath as NodePath<t.ImportDeclaration>;
    const importDeclaration = importDeclarationPath.node;

    const validSpecifiers = getValidSpecifiers(
      importDeclarationPath,
      importedBindings,
    );

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

    if (validSpecifiers.includes('macro') && callSite.callee.name === 'macro') {
      const declarator = callSitePath.parentPath.node as t.VariableDeclarator;
      const id = declarator.id as t.Identifier;
      const { ast, err } = evaluate(
        callSitePath.node.arguments[0] as t.Expression,
        callSitePath.scope,
        ['React', id.name],
      );
      if (!err) callSitePath.replaceWith(ast);
      variableDeclarationPath.scope.crawl();
      return;
    }

    if (!validSpecifiers.includes('block')) return;

    const RawComponent = callSite.arguments[0];

    // If we find a duplicate block call, we replace it with the cached block.
    if (t.isIdentifier(RawComponent) && blockCache.has(RawComponent.name)) {
      callSitePath.replaceWith(blockCache.get(RawComponent.name)!);
      return;
    }

    /**
     * Replaces `export default block(Component)` with
     * const default$ = block(Component);
     * export default default$;
     */
    if (callSitePath.parentPath.isExportDefaultDeclaration()) {
      const exportPath = callSitePath.parentPath;
      const exportName = callSitePath.scope.generateUidIdentifier('default$');
      exportPath.insertBefore(
        t.variableDeclaration('const', [
          t.variableDeclarator(exportName, callSite),
        ]),
      );

      exportPath.node.declaration = exportName;
      return; // this "creates" a new callSitePath, so it will be picked up again on the next visitor call. no need to continue.
    }

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
      // If we can extract out the name for the function expression, we use that.
      const isComponentNamed =
        t.isFunctionExpression(RawComponent) && t.isIdentifier(RawComponent.id);

      const anonymousComponentId = callSitePath.scope.generateUidIdentifier(
        isComponentNamed ? RawComponent.id!.name : 'anonymous$',
      );

      /**
       * const anonymous = () => <div />;
       */
      variableDeclarationPath.insertBefore(
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
    if (
      !t.isIdentifier(RawComponent) &&
      !t.isFunctionDeclaration(RawComponent) &&
      !t.isFunctionExpression(RawComponent) &&
      !t.isArrowFunctionExpression(RawComponent)
    ) {
      throw createDeopt(
        'Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration.',
        callSitePath,
      );
    }

    callSitePath.scope.crawl();

    const componentDeclarationPath = callSitePath.scope.getBinding(
      isComponentAnonymous
        ? // We know that the component is a identifier, so we can safely cast it.
          (callSite.arguments[0] as t.Identifier).name
        : RawComponent.name,
    )!.path;

    const Component = componentDeclarationPath.node as
      | t.VariableDeclarator
      | t.FunctionDeclaration;

    // We clone the component so we can restore it later.
    const originalComponent = t.cloneNode(Component);

    const SHARED: Shared = {
      callSitePath,
      callSite,
      Component,
      RawComponent,
      blockCache,
      originalComponent,
      importSource,
      globalPath: variableDeclarationPath,
      isReact,
      unstable,
      imports: {
        addNamed(name: string, source: string = importSource.value) {
          // We can't do this, as the visitor may retraverse the newly added `block` identifier.
          if (importedBindings[name]) {
            return t.identifier(importedBindings[name]!);
          }
          return addNamedCache(name, source, callSitePath);
        },
      },
    };

    if (
      t.isVariableDeclarator(Component) &&
      t.isArrowFunctionExpression(Component.init)
    ) {
      if (
        !t.isBlockStatement(Component.init.body) &&
        t.isJSXElement(Component.init.body)
      ) {
        /**
         * If the function body directly returns a JSX element (i.e., not wrapped in a BlockStatement),
         * we transform the JSX return into a BlockStatement before passing it to `transformComponent()`.
         *
         * ```jsx
         * const Component = () => <div></div>
         *
         * // becomes
         * const Component = () => {
         *   return <div></div>
         * }
         * ```
         */
        Component.init.body = t.blockStatement([
          t.returnStatement(Component.init.body),
        ]);
      }

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
    } else if (t.isImportSpecifier(Component)) {
      throw createDeopt(
        'You are using a component imported from another file. The component must be declared in the same file as the block.',
        componentDeclarationPath,
      );
    } else {
      throw createDeopt(
        'You can only use block() with a function declaration or arrow function.',
        callSitePath,
      );
    }
  };
};
