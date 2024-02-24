/**
 * THIS FILE IS DEPRECATED
 *
 * The file is no longer being used due to a broader
 * compilation process that covers this. This is only
 * preserved for future references.
 */
import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import {
  dedupeJSXAttributes,
  trimJSXChildren,
  isAttributeUnsupported,
  isComponent,
} from './utils/jsx';
import { deopt, catchError } from './utils/log';
import { findChild } from './utils/ast';
import type { Info } from './babel';
import { transformBlock } from './block';
import { getUniqueId } from './utils/id';

export const transformFor = (
  jsxElementPath: NodePath<t.JSXElement>,
  info: Info,
) => {
  if (!info.imports.source) return;

  const jsxElement = jsxElementPath.node;
  const jsxId = jsxElement.openingElement.name;
  if (
    !t.isJSXIdentifier(jsxId) ||
    !info.imports.For ||
    !info.imports.aliases.For?.has(jsxId.name)
  ) {
    return;
  }

  const expression = validateForExpression(jsxElementPath, info);

  if (hoistFor(jsxElementPath)) return;

  const callbackComponentId = getUniqueId(jsxElementPath, 'ForCallback');
  const blockComponentId = getUniqueId(jsxElementPath, 'ForBody');

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
      if (info.programPath.scope.hasBinding(path.node.name)) return;
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
  if (bailout) {
    jsxElementPath.stop();
    return;
  }

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
      t.callExpression(t.identifier(info.imports.block!), [
        callbackComponentId,
      ]),
    ),
  ]);

  const [originalComponentPath] = info.programPath.pushContainer(
    'body',
    originalComponent,
  );
  info.programPath.scope.registerDeclaration(originalComponentPath);

  const [blockComponentPath] = info.programPath.pushContainer(
    'body',
    blockComponent,
  );
  info.programPath.scope.registerDeclaration(blockComponentPath);

  expression.body = t.callExpression(blockComponentId, [
    t.objectExpression(ids.map((id) => t.objectProperty(id, id))),
  ]);

  const callExpressionPath = findChild<t.CallExpression>(
    jsxElementPath,
    'CallExpression',
  );

  if (!callExpressionPath || !callExpressionPath.isCallExpression()) return;
  catchError(() => {
    transformBlock(callExpressionPath, info);
  }, info.options.log);
};

export const validateForExpression = (
  jsxElementPath: NodePath<t.JSXElement>,
  info: Info,
): t.ArrowFunctionExpression => {
  const jsxElement = jsxElementPath.node;
  const VALIDATION_MESSAGE = 'Invalid For usage: https://million.dev/docs/for';

  trimJSXChildren(jsxElement);

  if (jsxElement.children.length !== 1) {
    throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
  }

  const child = jsxElement.children[0];

  if (!t.isJSXExpressionContainer(child)) {
    throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
  }

  const expression = child.expression;
  if (!t.isArrowFunctionExpression(expression)) {
    throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
  }

  if (t.isBlockStatement(expression.body)) {
    const blockStatementPath = jsxElementPath.get(
      'children.0.expression.body',
    )[0]!;

    const returnStatementPath = findChild<t.ReturnStatement>(
      blockStatementPath,
      'ReturnStatement',
    );

    if (returnStatementPath === null) {
      throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
    }

    const argument = returnStatementPath.node.argument;

    if (!t.isJSXElement(argument) && !t.isJSXFragment(argument)) {
      throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
    }
  } else if (
    !t.isJSXElement(expression.body) &&
    !t.isJSXFragment(expression.body)
  ) {
    throw deopt(VALIDATION_MESSAGE, info.filename, jsxElementPath);
  }

  return expression;
};

export const hoistFor = (jsxElementPath: NodePath<t.JSXElement>) => {
  const jsxElement = jsxElementPath.node;
  const jsxElementParent = jsxElementPath.parent;

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

        jsxElementPath.parent = jsxElementClone;

        return true;
      }
    }
  }
};
