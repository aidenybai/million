import * as t from '@babel/types';
import type { StateContext } from "./types";
import { unwrapNode } from "./utils/unwrap-node";
import { JSX_SKIP_ANNOTATION, SKIP_ANNOTATION } from './constants';
import { findComment } from './utils/ast';
import { isComponent, isComponentishName, isPathValid } from './utils/checks';
import { unwrapPath } from './utils/unwrap-path';
import { getImportIdentifier } from './utils/get-import-specifier';
import { IMPORTS } from './constants.new';
import { getDescriptiveName } from './utils/get-descriptive-name';
import { generateUniqueName } from './utils/generate-unique-name';
import { getRootStatementPath } from './utils/get-root-statement-path';

function isValidBlockCall(ctx: StateContext, path: babel.NodePath<t.CallExpression>): boolean {
  // Check for direct identifier usage e.g. import { block }
  const identifier = unwrapNode(path.node.callee, t.isIdentifier);
  if (identifier) {
    const binding = path.scope.getBindingIdentifier(identifier.name);
    const definition = ctx.definitions.identifiers.get(binding);
    if (definition) {
      return IMPORTS.block[ctx.mode] === definition;
    }
    return false;
  }
  // Check for namespace usage e.g. import * as million
  const memberExpr = unwrapNode(path.node.callee, t.isMemberExpression);
  if (memberExpr && !memberExpr.computed && t.isIdentifier(memberExpr.property)) {
    const object = unwrapNode(memberExpr.object, t.isIdentifier);
    if (object) {
      const binding = path.scope.getBindingIdentifier(object.name);
      const propName = memberExpr.property.name;
      const definitions = ctx.definitions.namespaces.get(binding);
      if (definitions) {
        for (let i = 0, len = definitions.length; i < len; i++) {
          const definition = definitions[i]!;
          if (definition.kind === 'named' && definition.name === propName) {
            return IMPORTS.block[ctx.mode] === definition;
          }
        }
      }
    }
  } 
  return false;
}

interface JSXStateContext {
  // The source of array values
  source: t.Identifier;
  // The expressions from the JSX moved into an array
  exprs: t.Expression[];
}

function skippableJSX<T extends t.Node>(node: T): T {
  return t.addComment(node, 'leading', JSX_SKIP_ANNOTATION);
}

function pushExpression(
  state: JSXStateContext,
  expr: t.Expression,
): number {
  const key = state.exprs.length;
  state.exprs.push(expr);
  return key;
}

function pushExpressionAndReplace(
  state: JSXStateContext,
  target: babel.NodePath<t.Expression>,
  top: boolean,
): void {
  const key = pushExpression(state, target.node);
  const expr = t.memberExpression(state.source, t.numericLiteral(key), true);
  target.replaceWith(top ? expr : t.jsxExpressionContainer(expr));
}

function extractJSXExpressionsFromExpression(
  state: JSXStateContext,
  expr: babel.NodePath<t.Expression>,
): void {
  const unwrappedJSX = unwrapPath(expr, t.isJSXElement);
  if (unwrappedJSX) {
    extractJSXExpressions(state, unwrappedJSX, true)
    return;
  }
  const unwrappedFragment = unwrapPath(expr, t.isJSXFragment);
  if (unwrappedFragment) {
    extractJSXExpressions(state, unwrappedFragment, true)
    return;
  }
  pushExpressionAndReplace(state, expr, true);
}

function extractJSXExpressionsFromJSXSpreadChild(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXSpreadChild>,
): void {
  extractJSXExpressionsFromExpression(state, path.get('expression'));
}

function extractJSXExpressionsFromJSXExpressionContainer(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXExpressionContainer>,
): void {
  const expr = path.get('expression');
  if (isPathValid(expr, t.isExpression)) {
    extractJSXExpressionsFromExpression(state, expr);
  }
}

function extractJSXExpressionsFromJSXAttribute(
  state: JSXStateContext,
  attr: babel.NodePath<t.JSXAttribute>,
): void {
  const value = attr.get('value');
  if (isPathValid(value, t.isJSXElement)) {
    extractJSXExpressions(state, value, false);
  } else if (isPathValid(value, t.isJSXFragment)) {
    extractJSXExpressions(state, value, false);
  } else if (isPathValid(value, t.isJSXExpressionContainer)) {
    extractJSXExpressionsFromJSXExpressionContainer(state, value);
  }
}

function extractJSXExpressionsFromJSXSpreadAttribute(
  state: JSXStateContext,
  attr: babel.NodePath<t.JSXSpreadAttribute>,
): void {
  extractJSXExpressionsFromExpression(state, attr.get('argument'));
}

function extractJSXExpressionsFromJSXAttributes(
  state: JSXStateContext,
  attrs: babel.NodePath<t.JSXAttribute | t.JSXSpreadAttribute>[],
): void {
  for (let i = 0, len = attrs.length; i < len; i++) {
    const attr = attrs[i];

    if (isPathValid(attr, t.isJSXAttribute)) {
      extractJSXExpressionsFromJSXAttribute(state, attr);
    } else if (isPathValid(attr, t.isJSXSpreadAttribute)) {
      extractJSXExpressionsFromJSXSpreadAttribute(state, attr);
    }
  }
}

function extractJSXExpressionsFromJSXElement(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXElement>,
  top: boolean,
): boolean {
  const openingElement = path.get('openingElement');
  const trueOpeningElement = openingElement.get('name');

  if (isPathValid(trueOpeningElement, t.isJSXMemberExpression)) {
    if (!top) {
      pushExpressionAndReplace(state, path, false);
    }
    return true;
  } else if (
    isPathValid(trueOpeningElement, t.isJSXIdentifier)
    && (/^[A-Z]_/.test(trueOpeningElement.node.name) || trueOpeningElement.node.name === 'this')
  ) {
    if (!top) {
      pushExpressionAndReplace(state, path, false);
    }
    return true;
  }
  extractJSXExpressionsFromJSXAttributes(state, openingElement.get('attributes'));
  return false;
}

function extractJSXExpressions(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXElement | t.JSXFragment>,
  top: boolean,
): void {
  if (isPathValid(path, t.isJSXElement) && extractJSXExpressionsFromJSXElement(state, path, top)) {
    return;
  }
  const children = path.get('children');
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];

    if (isPathValid(child, t.isJSXElement)) {
      extractJSXExpressions(state, child, false);
    } else if (isPathValid(child, t.isJSXFragment)) {
      extractJSXExpressions(state, child, false);
    } else if (isPathValid(child, t.isJSXSpreadChild)) {
      extractJSXExpressionsFromJSXSpreadChild(state, child);
    } else if (isPathValid(child, t.isJSXExpressionContainer)) {
      extractJSXExpressionsFromJSXExpressionContainer(state, child);
    }
  }
}

function transformJSX(ctx: StateContext, path: babel.NodePath<t.JSXElement | t.JSXFragment>): void {
  if (findComment(path.node, JSX_SKIP_ANNOTATION)) {
    return;
  }
  const state: JSXStateContext = {
    source: path.scope.generateUidIdentifier('v'),
    exprs: [],
  };
  extractJSXExpressions(state, path, true);

  const descriptiveName = getDescriptiveName(path, 'Anonymous');
  const id = generateUniqueName(
    path,
    isComponentishName(descriptiveName)
      ? descriptiveName
      : 'JSX_' + descriptiveName,
  );
  const rootPath = getRootStatementPath(path);

  const args: t.Pattern[] = [];

  if (state.exprs.length) {
    args.push(t.objectPattern([t.objectProperty(t.identifier('v'), state.source)]));
  }

  const newComponent = t.arrowFunctionExpression(
    args,
    path.node,
  );
  const options = t.objectExpression([
    // TODO add dev mode
    t.objectProperty(
      t.identifier('name'),
      t.stringLiteral(id.name),
    ),
    t.objectProperty(
      t.identifier('shouldUpdate'),
      getImportIdentifier(ctx, path, IMPORTS.areCompiledBlockPropsEqual[ctx.mode]),
    ),
  ]);

  const generatedBlock = t.variableDeclaration(
    'const',
    [t.variableDeclarator(id, t.addComment(
      t.callExpression(
        getImportIdentifier(ctx, path, IMPORTS.block[ctx.mode]),
        [
          newComponent,
          options,
        ],
      ),
      'leading',
      SKIP_ANNOTATION,
    ))],
  );

  rootPath.insertBefore(generatedBlock);

  path.replaceWith(
    skippableJSX(t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier(id.name), [
        t.jsxAttribute(t.jsxIdentifier('v'), t.jsxExpressionContainer(t.arrayExpression(state.exprs))),
      ]),
      t.jsxClosingElement(t.jsxIdentifier(id.name)),
      [],
    )),
  );
}

export function transformBlock(ctx: StateContext, path: babel.NodePath<t.CallExpression>): void {
  // Check first if the call is a valid `block` call
  if (!isValidBlockCall(ctx, path)) {
    return;
  }
  // Check if we should skip because the compiler
  // can also output a `block` call. Without this,
  // compiler will suffer a recursion.
  if (findComment(path.node, SKIP_ANNOTATION)) {
    return;
  }
  const args = path.get('arguments');
  // Make sure that we have at least one argument,
  // and that argument is a component.
  if (args.length <= 0) {
    return;
  }
  const identifier = unwrapPath(args[0]!, t.isIdentifier);
  // Handle identifiers differently
  if (identifier) {
    return;
  }
  const component = unwrapPath(args[0]!, isComponent);
  if (!component) {
    return;
  }
  // Transform all top-level JSX (aka the JSX owned by the component)
  component.traverse({
    JSXElement(childPath) {
      const functionParent = childPath.getFunctionParent();
      if (functionParent === component) {
        transformJSX(ctx, childPath);
      }
    },
    JSXFragment(childPath) {
      const functionParent = childPath.getFunctionParent();
      if (functionParent === component) {
        transformJSX(ctx, childPath);
      }
    },
  });

  path.replaceWith(component);
}
