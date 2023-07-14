import * as t from '@babel/types';
import { collectImportedBindings } from './bindings';
import {
  addNamedCache,
  createDeopt,
  getValidSpecifiers,
  resolveCorrectImportSource,
  trimJsxChildren,
} from './utils';
import { callExpressionVisitor } from './call-expression-visitor';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const jsxElementVisitor = (options: Options = {}, isReact = true) => {
  return (
    jsxElementPath: NodePath<t.JSXElement>,
    _blockCache: Map<string, t.Identifier>,
  ) => {
    const jsxElement = jsxElementPath.node;

    const programPath = jsxElementPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;
    const importedBindings = collectImportedBindings(programPath);

    const jsxId = jsxElement.openingElement.name;
    if (!t.isJSXIdentifier(jsxId) || !importedBindings[jsxId.name]) {
      return;
    }

    const forComponentBinding = programPath.scope.getBinding(jsxId.name); // jsxId.name = 'For'
    if (!forComponentBinding) {
      /**
       * Deoptimization errors are thrown when the compiler is unable to optimize the code.
       * They are catched globally and logged as warnings, but the code is not compiled.
       * This is to prevent the compiler from generating invalid code.
       */
      throw createDeopt(
        'Unable to find AST binding for For. Check that the For component is imported correctly.',
        programPath,
      );
    }

    const importDeclarationPath = forComponentBinding.path
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

    if (!validSpecifiers.includes('For')) return;

    trimJsxChildren(jsxElement);

    if (jsxElement.children.length !== 1) {
      throw createDeopt(
        'For component must have exactly one child',
        jsxElementPath,
      );
    }

    const child = jsxElement.children[0];

    if (!t.isJSXExpressionContainer(child)) {
      throw createDeopt(
        'For component must have exactly one child',
        jsxElementPath,
      );
    }

    const expression = child.expression;

    if (!t.isArrowFunctionExpression(expression)) {
      throw createDeopt(
        'For component must consume a reference to an arrow function',
        jsxElementPath,
      );
    }
    const originalComponentId =
      programPath.scope.generateUidIdentifier('original');
    const blockComponentId = programPath.scope.generateUidIdentifier();

    const block = importedBindings.block
      ? t.identifier('block')
      : addNamedCache('block', importSource.value, programPath);

    // also extract out any identifiers in the arrow function that cannot be accessed after we extract
    // the arrow function into a variable declaration

    const idNames = new Set<string>(
      (expression.params as t.Identifier[]).map((id) => id.name),
    );

    jsxElementPath.traverse({
      Identifier(path: NodePath<t.Identifier>) {
        if (programPath.scope.hasBinding(path.node.name)) return;
        idNames.add(path.node.name);
      },
    });

    const ids = [...idNames].map((id) => t.identifier(id));

    // We do a similar extraction process as in the call expression visitor
    const originalComponent = t.variableDeclaration('const', [
      t.variableDeclarator(
        originalComponentId,
        t.arrowFunctionExpression(
          [t.objectPattern(ids.map((id) => t.objectProperty(id, id)))],
          t.isBlockStatement(expression.body)
            ? expression.body
            : t.blockStatement([t.returnStatement(expression.body)]),
        ),
      ),
    ]);

    const blockComponent = t.variableDeclaration('const', [
      t.variableDeclarator(
        blockComponentId,
        t.callExpression(block, [originalComponentId]),
      ),
    ]);

    programPath.node.body.push(originalComponent, blockComponent);

    expression.body = t.callExpression(blockComponentId, [
      t.objectExpression(ids.map((id) => t.objectProperty(id, id))),
    ]);

    const programBodyPath = programPath.get('body');
    const originalComponentPath = programBodyPath[
      programBodyPath.length - 1
    ] as NodePath<t.VariableDeclaration>;

    const visitor = callExpressionVisitor(options, isReact);

    const callSitePath = originalComponentPath
      .get('declarations')[0]!
      .get('init') as NodePath<t.CallExpression>;

    visitor(callSitePath, new Map());
  };
};
