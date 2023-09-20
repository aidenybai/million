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
  valid = false,
) => {
  return (
    callSitePath: NodePath<t.CallExpression>,
    blockCache: Map<string, t.Identifier>,
    file: string,
  ) => {
    // Callsite refers to the block call (e.g. the AST node of "block(Componnent)")
    const callSite = callSitePath.node;
    if (
      callSite.leadingComments?.some((comment) =>
        comment.value.startsWith(TRANSFORM_ANNOTATION),
      )
    )
      return;

    const globalPath = callSitePath.findParent(
      (path) => path.parentPath?.isProgram() || path.isProgram(),
    )!;

    // We only want to optimize block calls.
    // check if the block is aliased (e.g. import { block as createBlock } ...)
    const programPath = callSitePath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;
    const { bindings, aliases } = collectImportedBindings(programPath);

    if (!t.isIdentifier(callSite.callee) || !aliases[callSite.callee.name])
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
    if (!blockCallBinding) return;

    const importDeclarationPath = blockCallBinding.path
      .parentPath as NodePath<t.ImportDeclaration>;
    const importDeclaration = importDeclarationPath.node;

    const validSpecifiers = getValidSpecifiers(
      importDeclarationPath,
      aliases,
      file,
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
      globalPath.scope.crawl();
      return;
    }

    if (!validSpecifiers.includes('block') && !valid) return;

    let RawComponent: any = callSite.arguments[0];

    if (t.isIdentifier(RawComponent) && blockCache.has(RawComponent.name)) {
      throw createDeopt(
        'Found duplicate block call. Make sure you are not calling block() more than once with the same component.',
        file,
        callSitePath,
      );
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

      const unique = globalPath.scope.generateUid('');
      const anonymousComponentId = isComponentNamed
        ? RawComponent.id!
        : t.identifier(`M${unique}`);

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
    if (
      !t.isIdentifier(RawComponent) &&
      !t.isFunctionDeclaration(RawComponent) &&
      !t.isFunctionExpression(RawComponent) &&
      !t.isArrowFunctionExpression(RawComponent)
    ) {
      if (
        t.isJSXElement(RawComponent) &&
        t.isJSXIdentifier(RawComponent.openingElement.name)
      ) {
        RawComponent = t.identifier(RawComponent.openingElement.name.name);
        callSite.arguments[0] = RawComponent;
        callSitePath.scope.crawl();
      } else {
        throw createDeopt(
          'Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration.',
          file,
          callSitePath,
        );
      }
    }

    callSitePath.scope.crawl();

    const componentDeclarationPath = callSitePath.scope.getBinding(
      isComponentAnonymous
        ? // We know that the component is a identifier, so we can safely cast it.
          (callSite.arguments[0] as t.Identifier).name
        : RawComponent.name,
    )!.path;

    if (componentDeclarationPath.isVariableDeclarator()) {
      const init = componentDeclarationPath.node.init;
      if (
        t.isCallExpression(init) &&
        ((t.isIdentifier(init.callee) && init.callee.name === 'forwardRef') ||
          (t.isMemberExpression(init.callee) &&
            t.isIdentifier(init.callee.property) &&
            init.callee.property.name === 'forwardRef'))
      ) {
        const forwardRefComponent = init.arguments[0];
        if (
          t.isIdentifier(forwardRefComponent) ||
          t.isFunctionExpression(forwardRefComponent) ||
          t.isArrowFunctionExpression(forwardRefComponent)
        ) {
          const anonymousComponentId =
            componentDeclarationPath.scope.generateUidIdentifier('anonymous$');
          componentDeclarationPath.parentPath.insertBefore(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                anonymousComponentId,
                t.callExpression(t.identifier(bindings.block!), [
                  forwardRefComponent,
                ]),
              ),
            ]),
          );
          init.arguments[0] = anonymousComponentId;
          const { parent, node } = callSitePath;
          if (
            t.isVariableDeclarator(parent) &&
            'arguments' in node &&
            t.isIdentifier(node.arguments[0])
          ) {
            parent.init = node.arguments[0];
          }
          callSitePath.scope.crawl();
          return;
        }
      }
    }

    const Component = componentDeclarationPath.node as
      | t.VariableDeclarator
      | t.FunctionDeclaration;

    // We clone the component so we can restore it later.
    const originalComponent = t.cloneNode(Component);

    const SHARED: Shared = {
      file,
      callSitePath,
      callSite,
      Component,
      RawComponent,
      blockCache,
      originalComponent,
      importSource,
      globalPath,
      isReact,
      unstable,
      imports: {
        addNamed(name: string, source: string = importSource.value) {
          if (bindings[name]) {
            return t.identifier(bindings[name]!);
          }
          return addNamedCache(name, source, callSitePath, programPath);
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
          ) as NodePath<t.BlockStatement>,
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
          componentBodyPath: resolvePath(
            componentDeclarationPath.get('body'),
          ) as NodePath<t.BlockStatement>,
        },
        SHARED,
      );
    } else if (t.isImportSpecifier(Component)) {
      throw createDeopt(
        'You are using a component imported from another file. The component must be declared in the same file as the block.',
        file,
        componentDeclarationPath,
      );
    } else {
      throw createDeopt(
        'You can only use block() with a function declaration or arrow function.',
        file,
        callSitePath,
      );
    }
  };
};
