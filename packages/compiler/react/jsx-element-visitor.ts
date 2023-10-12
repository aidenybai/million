import * as t from '@babel/types';
import { collectImportedBindings } from './bindings';
import {
  createDeopt,
  getValidSpecifiers,
  handleVisitorError,
  hasStyledAttributes,
  isComponent,
  removeDuplicateJSXAttributes,
  resolveCorrectImportSource,
  resolvePath,
  trimJsxChildren,
} from './utils';
import { callExpressionVisitor } from './call-expression-visitor';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const jsxElementVisitor = (options: Options = {}, isReact = true) => {
  return (jsxElementPath: NodePath<t.JSXElement>, file: string) => {
    if (!isReact) return; // doesn't support Preact yet
    const jsxElement = jsxElementPath.node;

    const programPath = jsxElementPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;
    const { bindings, aliases } = collectImportedBindings(programPath);

    const jsxId = jsxElement.openingElement.name;
    if (!t.isJSXIdentifier(jsxId) || !aliases[jsxId.name]) {
      return;
    }

    // update bindings if generated via call expression visitor
    programPath.scope.crawl();

    const forComponentBinding = programPath.scope.getBinding(jsxId.name); // jsxId.name = 'For'
    if (!forComponentBinding) {
      /**
       * Deoptimization errors are thrown when the compiler is unable to optimize the code.
       * They are catched globally and logged as warnings, but the code is not compiled.
       * This is to prevent the compiler from generating invalid code.
       */
      throw createDeopt(
        'Unable to find AST binding for For. Check that the For component is imported correctly.',
        file,
        programPath,
      );
    }

    const importDeclarationPath = forComponentBinding.path
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

    const block = t.identifier(bindings.block ?? 'block');
    if (!bindings.block) {
      importDeclaration.specifiers.push(t.importSpecifier(block, block));
    }

    if (!validSpecifiers.includes('For')) return;

    trimJsxChildren(jsxElement);

    if (jsxElement.children.length !== 1) {
      throw createDeopt(
        'For component must have exactly one child',
        file,
        jsxElementPath,
      );
    }

    const child = jsxElement.children[0];

    if (!t.isJSXExpressionContainer(child)) {
      throw createDeopt(
        'For component must have exactly one child',
        file,
        jsxElementPath,
      );
    }

    const expression = child.expression;
    if (!t.isArrowFunctionExpression(expression)) {
      throw createDeopt(
        'For component must consume a reference to an arrow function',
        file,
        jsxElementPath,
      );
    }

    if (t.isBlockStatement(expression.body)) {
      const expressionPath = resolvePath(jsxElementPath.get('children'));
      const returnStatementPath = resolvePath(
        expressionPath.find((path) => path.isReturnStatement())!,
      ) as NodePath<t.ReturnStatement>;
      const argument = returnStatementPath.node.argument;

      if (!t.isJSXElement(argument) && !t.isJSXFragment(argument)) {
        return;
      }
    } else if (
      !t.isJSXElement(expression.body) &&
      !t.isJSXFragment(expression.body)
    ) {
      return;
    }

    const jsxElementParent = jsxElementPath.parent;

    if (t.isJSXElement(jsxElementParent)) {
      const type = jsxElementParent.openingElement.name;

      trimJsxChildren(jsxElementParent);
      if (
        t.isJSXIdentifier(type) &&
        type.name.toLowerCase() === type.name &&
        jsxElementParent.children.length === 1
      ) {
        if (
          !jsxElement.openingElement.attributes.some((attr) => {
            if (t.isJSXAttribute(attr) && attr.name.name === 'as') {
              return true;
            }
            return false;
          })
        ) {
          const jsxElementClone = t.cloneNode(jsxElement);

          jsxElementClone.openingElement.attributes =
            removeDuplicateJSXAttributes([
              ...jsxElementClone.openingElement.attributes,
              ...jsxElementParent.openingElement.attributes,
              t.jsxAttribute(t.jsxIdentifier('as'), t.stringLiteral(type.name)),
            ]);

          jsxElementPath.parent = jsxElementClone;

          return;
        }
      }
    }

    const callbackComponentId =
      programPath.scope.generateUidIdentifier('callback$');
    const blockComponentId = programPath.scope.generateUidIdentifier();

    const idNames = new Set<string>();

    for (const id of expression.params) {
      if (t.isIdentifier(id)) {
        idNames.add(id.name);
        continue;
      }
      if (t.isObjectPattern(id)) {
        for (const prop of id.properties) {
          if (t.isObjectProperty(prop)) {
            if (t.isIdentifier(prop.key)) {
              idNames.add(prop.key.name);
            } else if (t.isStringLiteral(prop.key)) {
              idNames.add(prop.key.value);
            }
          }
        }
      }
    }

    let bailout = false;
    jsxElementPath.traverse({
      JSXElement(path) {
        const jsxId = path.node.openingElement.name;
        if (t.isJSXIdentifier(jsxId) && isComponent(jsxId.name)) {
          path.stop();
          bailout = true;
        }
      },
      JSXAttribute(path) {
        const jsxId = path.node.name;
        if (!t.isJSXIdentifier(jsxId)) return;

        if (jsxId.name === 'ref' || hasStyledAttributes(path.node)) {
          path.stop();
          bailout = true;
        }
      },
      JSXSpreadAttribute(path) {
        path.stop();
        bailout = true;
      },
      JSXSpreadChild(path) {
        path.stop();
        bailout = true;
      },
      Identifier(path: NodePath<t.Identifier>) {
        if (programPath.scope.hasBinding(path.node.name)) return;
        const targetPath = path.parentPath;

        if (targetPath.isMemberExpression()) {
          if (!targetPath.node.computed && targetPath.node.object !== path.node)
            return;

          if (targetPath.parentPath.isCallExpression()) {
            if (targetPath.parentPath.node.callee !== targetPath.node) return;
          }
        }

        if (targetPath.isObjectProperty() && !targetPath.node.computed) {
          if (targetPath.node.key !== path.node) return;
        }

        if (
          targetPath.isObjectMethod() ||
          targetPath.isJSXAttribute() ||
          targetPath.isJSXOpeningElement() ||
          targetPath.isJSXClosingElement()
        ) {
          return;
        }

        if (
          targetPath.isFunctionExpression() ||
          targetPath.isArrowFunctionExpression()
        ) {
          const functionPath = resolvePath(targetPath) as NodePath<
            t.ArrowFunctionExpression | t.FunctionExpression
          >;

          if (functionPath.node.params.some((param) => param === path.node)) {
            return;
          }
        }

        if (!jsxElementPath.scope.hasBinding(path.node.name)) return;

        idNames.add(path.node.name);
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (bailout) return jsxElementPath.stop();

    const ids = [...idNames].map((id) => t.identifier(id));
    const body = t.cloneNode(expression.body);

    // We do a similar extraction process as in the call expression visitor
    const originalComponent = t.variableDeclaration('const', [
      t.variableDeclarator(
        callbackComponentId,
        t.arrowFunctionExpression(
          [
            t.objectPattern(
              ids.map((id) => t.objectProperty(id, id, false, true)),
            ),
          ],
          t.isBlockStatement(body)
            ? body
            : t.blockStatement([t.returnStatement(body)]),
        ),
      ),
    ]);

    const blockComponent = t.variableDeclaration('const', [
      t.variableDeclarator(
        blockComponentId,
        t.callExpression(block, [callbackComponentId]),
      ),
    ]);

    programPath.node.body.push(originalComponent, blockComponent);

    expression.body = t.callExpression(blockComponentId, [
      t.objectExpression(ids.map((id) => t.objectProperty(id, id))),
    ]);

    const programBodyPath = programPath.get('body');
    const originalComponentPath = programBodyPath[programBodyPath.length - 1];

    if (
      !originalComponentPath ||
      !resolvePath(originalComponentPath).isVariableDeclaration()
    )
      return;

    const visitor = callExpressionVisitor(options, isReact, true, true);

    const callSitePath = originalComponentPath
      .get('declarations')[0]!
      .get('init');

    if (callSitePath.isCallExpression()) {
      callSitePath.scope.crawl();
      handleVisitorError(
        () => visitor(callSitePath, new Map(), file),
        options.mute,
      );
    }
  };
};
