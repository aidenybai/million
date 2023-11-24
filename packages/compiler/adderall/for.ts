import * as t from '@babel/types';
import {
  dedupeJSXAttributes,
  trimJSXChildren,
  isAttributeUnsupported,
  isComponent,
} from './utils/jsx';
import { deopt, catchError } from './utils/log';
import { callExpressionVisitor } from './call-expression-visitor';
import { findChild } from './traversal';
import type { NodePath } from '@babel/core';
import type { Options } from '../options';
import type { Info } from '../compiler';

export const transformFor = (
  options: Options,
  path: NodePath<t.JSXElement>,
  dirname: string,
  info: Info,
) => {
  const jsxElement = path.node;
  const programPath = path.findParent((path) =>
    path.isProgram(),
  ) as NodePath<t.Program>;

  const jsxId = jsxElement.openingElement.name;
  if (!t.isJSXIdentifier(jsxId) || !info.For || info.For !== jsxId.name) {
    return;
  }

  // update bindings if generated via call expression visitor
  programPath.scope.crawl();

  const expression = validateForExpression(jsxElement, dirname, path);

  if (hoistFor(jsxElement, path)) return;

  const callbackComponentId =
    programPath.scope.generateUidIdentifier('callback$');
  const blockComponentId = programPath.scope.generateUidIdentifier();

  const idNames = new Set<string>();

  for (let i = 0, j = expression.params.length; i < j; ++i) {
    const id = expression.params[i]!;
    if (t.isIdentifier(id)) {
      idNames.add(id.name);
      continue;
    }
    if (!t.isObjectPattern(id)) continue;

    for (let k = 0, l = id.properties.length; k < l; ++k) {
      const prop = id.properties[k]!;
      if (!t.isObjectProperty(prop)) continue;

      if (t.isIdentifier(prop.key)) {
        idNames.add(prop.key.name);
      } else if (t.isStringLiteral(prop.key)) {
        idNames.add(prop.key.value);
      }
    }
  }

  let bailout = false;
  path.traverse({
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

      if (jsxId.name === 'ref' || isAttributeUnsupported(path.node)) {
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
        if (targetPath.node.params.some((param) => param === path.node)) {
          return;
        }
      }

      if (!path.scope.hasBinding(path.node.name)) return;

      idNames.add(path.node.name);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (bailout) return path.stop();

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
      t.callExpression(t.identifier(info.block), [callbackComponentId]),
    ),
  ]);

  programPath.node.body.push(originalComponent, blockComponent);

  expression.body = t.callExpression(blockComponentId, [
    t.objectExpression(ids.map((id) => t.objectProperty(id, id))),
  ]);

  const programBodyPath = programPath.get('body');
  const originalComponentPath = programBodyPath[programBodyPath.length - 1];

  if (!originalComponentPath || !originalComponentPath.isVariableDeclaration())
    return;

  const visitor = callExpressionVisitor(options, isReact, true, true);

  const callSitePath = originalComponentPath
    .get('declarations')[0]!
    .get('init');

  if (callSitePath.isCallExpression()) {
    callSitePath.scope.crawl();
    catchError(() => visitor(callSitePath, new Map(), dirname), options.mute);
  }
};

export const validateForExpression = (
  jsxElement: t.JSXElement,
  dirname: string,
  path: NodePath<t.JSXElement>,
): t.ArrowFunctionExpression => {
  const VALIDATION_MESSAGE = 'Invalid For usage: https://million.dev/docs/for';

  trimJSXChildren(jsxElement);

  if (jsxElement.children.length !== 1) {
    throw deopt(VALIDATION_MESSAGE, dirname, path);
  }

  const child = jsxElement.children[0];

  if (!t.isJSXExpressionContainer(child)) {
    throw deopt(VALIDATION_MESSAGE, dirname, path);
  }

  const expression = child.expression;
  if (!t.isArrowFunctionExpression(expression)) {
    throw deopt(VALIDATION_MESSAGE, dirname, path);
  }

  if (t.isBlockStatement(expression.body)) {
    const blockStatementPath = path.get('children.0.expression.body')[0]!;

    const returnStatementPath = findChild<t.ReturnStatement>(
      blockStatementPath,
      'ReturnStatement',
    );

    if (returnStatementPath === null) {
      throw deopt(VALIDATION_MESSAGE, dirname, path);
    }

    const argument = returnStatementPath.node.argument;

    if (!t.isJSXElement(argument) && !t.isJSXFragment(argument)) {
      throw deopt(VALIDATION_MESSAGE, dirname, path);
    }
  } else if (
    !t.isJSXElement(expression.body) &&
    !t.isJSXFragment(expression.body)
  ) {
    throw deopt(VALIDATION_MESSAGE, dirname, path);
  }

  return expression;
};

export const hoistFor = (
  jsxElement: t.JSXElement,
  path: NodePath<t.JSXElement>,
) => {
  const jsxElementParent = path.parent;

  if (t.isJSXElement(jsxElementParent)) {
    const type = jsxElementParent.openingElement.name;

    trimJSXChildren(jsxElementParent);
    if (
      t.isJSXIdentifier(type) &&
      type.name.toLowerCase() === type.name &&
      jsxElementParent.children.length === 1
    ) {
      if (
        !jsxElement.openingElement.attributes.some(
          (attr) => t.isJSXAttribute(attr) && attr.name.name === 'as',
        )
      ) {
        const jsxElementClone = t.cloneNode(jsxElement);

        jsxElementClone.openingElement.attributes = dedupeJSXAttributes([
          ...jsxElementClone.openingElement.attributes,
          ...jsxElementParent.openingElement.attributes,
          t.jsxAttribute(t.jsxIdentifier('as'), t.stringLiteral(type.name)),
        ]);

        path.parent = jsxElementClone;

        return true;
      }
    }
  }
};
