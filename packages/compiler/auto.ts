import type * as babel from '@babel/core';
import * as t from '@babel/types';
import { REACT_IMPORTS, TRACKED_IMPORTS } from './constants';
import type { StateContext } from './types';
import {
  isComponentishName,
  isPathValid,
  isStatementTopLevel,
} from './utils/checks';
import { generateUniqueName } from './utils/generate-unique-name';
import { getDescriptiveName } from './utils/get-descriptive-name';
import { getImportIdentifier } from './utils/get-import-specifier';
import { getRootStatementPath } from './utils/get-root-statement-path';
import { getValidImportDefinition } from './utils/get-valid-import-definition';
import { isGuaranteedLiteral } from './utils/is-guaranteed-literal';
import { isJSXComponentElement } from './utils/is-jsx-component-element';
import { logImprovement } from './utils/log';
import { isUseClient } from './utils/is-use-client';
import { registerImportDefinition } from './utils/register-import-definition';
import { unwrapNode } from './utils/unwrap-node';
import { unwrapPath } from './utils/unwrap-path';
import { shouldBeIgnored } from './utils/ast';

interface JSXStateContext {
  bailout: boolean;

  elements: number;
  attributes: number;
  components: number;
  text: number;
  returns: number;
}

function measureExpression(
  state: JSXStateContext,
  expr: babel.NodePath<t.Expression>,
  portal: boolean,
): void {
  const unwrappedJSX = unwrapPath(expr, t.isJSXElement);
  if (unwrappedJSX) {
    measureJSXExpressions(state, unwrappedJSX);
    return;
  }
  const unwrappedFragment = unwrapPath(expr, t.isJSXFragment);
  if (unwrappedFragment) {
    measureJSXExpressions(state, unwrappedFragment);
    return;
  }
  if (isGuaranteedLiteral(expr.node)) {
    return;
  }
  if (portal) {
    state.components++;
  } else {
    state.attributes++;
  }
}

function measureJSXSpreadChild(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXSpreadChild>,
): void {
  measureExpression(state, path.get('expression'), false);
}

function measureJSXExpressionContainer(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXExpressionContainer>,
  portal: boolean,
): void {
  const expr = path.get('expression');
  if (isPathValid(expr, t.isExpression)) {
    measureExpression(state, expr, portal);
  }
}

function measureJSXAttribute(
  state: JSXStateContext,
  attr: babel.NodePath<t.JSXAttribute>,
): void {
  const value = attr.get('value');
  if (isPathValid(value, t.isJSXElement)) {
    measureJSXExpressions(state, value);
  } else if (isPathValid(value, t.isJSXFragment)) {
    measureJSXExpressions(state, value);
  } else if (isPathValid(value, t.isJSXExpressionContainer)) {
    measureJSXExpressionContainer(state, value, false);
  }
}

function measureJSXSpreadAttribute(
  state: JSXStateContext,
  attr: babel.NodePath<t.JSXSpreadAttribute>,
): void {
  measureExpression(state, attr.get('argument'), false);
}

function measureJSXAttributes(
  state: JSXStateContext,
  attrs: babel.NodePath<t.JSXAttribute | t.JSXSpreadAttribute>[],
): void {
  // TODO handle specific attributes
  for (let i = 0, len = attrs.length; i < len; i++) {
    const attr = attrs[i];

    if (isPathValid(attr, t.isJSXAttribute)) {
      measureJSXAttribute(state, attr);
    } else if (isPathValid(attr, t.isJSXSpreadAttribute)) {
      measureJSXSpreadAttribute(state, attr);
    }
  }
}

function measureJSXElement(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXElement>,
): boolean {
  const openingElement = path.get('openingElement');
  /**
   * If this is a component element, move the JSX expression
   * to the expression array.
   */
  if (isJSXComponentElement(path)) {
    state.components++;
    return true;
  }
  /**
   * Otherwise, continue extracting in attributes
   */
  state.elements++;
  measureJSXAttributes(state, openingElement.get('attributes'));
  return false;
}

function measureJSXExpressions(
  state: JSXStateContext,
  path: babel.NodePath<t.JSXElement | t.JSXFragment>,
): void {
  if (isPathValid(path, t.isJSXElement) && measureJSXElement(state, path)) {
    return;
  }
  const children = path.get('children');
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];

    if (isPathValid(child, t.isJSXElement)) {
      measureJSXExpressions(state, child);
    } else if (isPathValid(child, t.isJSXFragment)) {
      measureJSXExpressions(state, child);
    } else if (isPathValid(child, t.isJSXSpreadChild)) {
      measureJSXSpreadChild(state, child);
    } else if (isPathValid(child, t.isJSXExpressionContainer)) {
      measureJSXExpressionContainer(state, child, true);
    } else if (isPathValid(child, t.isJSXText)) {
      if (child.node.value.trim() !== '') state.text++;
    }
  }
}

function shouldTransform(
  ctx: StateContext,
  name: string,
  path: babel.NodePath,
): boolean {
  const state: JSXStateContext = {
    bailout: false,
    elements: 0,
    components: 0,
    attributes: 0,
    text: 0,
    returns: 0,
  };

  path.traverse({
    JSXElement(innerPath) {
      measureJSXExpressions(state, innerPath);
      innerPath.skip();
    },
    JSXFragment(innerPath) {
      measureJSXExpressions(state, innerPath);
      innerPath.skip();
    },
    ReturnStatement(innerPath) {
      if (innerPath.scope.uid !== path.scope.uid) return;
      state.returns++;
      if (state.returns > 1) {
        state.bailout = true;
        innerPath.stop();
      }
    },
  });

  if (state.bailout) return false;

  const good = state.elements + state.attributes + state.text;
  if (good < 5) return false;
  const bad = state.components;
  const improvement = (good - bad) / (good + bad);

  if (isNaN(improvement) || !isFinite(improvement)) return false;

  const threshold =
    typeof ctx.options.auto === 'object' && ctx.options.auto.threshold
      ? ctx.options.auto.threshold
      : 0.1;

  if (improvement <= threshold) return false;
  if (ctx.options.log === true || ctx.options.log === 'info') {
    logImprovement(
      name,
      improvement,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ctx.options.telemetry,
    );
  }

  return true;
}

function transformFunctionDeclaration(
  ctx: StateContext,
  program: babel.NodePath<t.Program>,
  path: babel.NodePath<t.FunctionDeclaration>,
): void {
  if (isStatementTopLevel(path)) {
    if (shouldBeIgnored(path)) {
      return;
    }
    const decl = path.node;
    // Check if declaration is FunctionDeclaration
    if (
      // Check if the declaration has an identifier, and then check
      decl.id &&
      // if the name is component-ish
      isComponentishName(decl.id.name) &&
      // Might be component-like, but the only valid components
      // have zero or one parameter
      decl.params.length < 2 &&
      // For RSC, only transform if it's a client component
      (ctx.options.rsc
        ? ctx.topLevelRSC || isUseClient(decl.body.directives)
        : true) &&
      // Check if the function should be transformed
      shouldTransform(ctx, decl.id.name, path)
    ) {
      const newPath = program.unshiftContainer(
        'body',
        t.variableDeclaration('const', [
          t.variableDeclarator(
            decl.id,
            t.callExpression(
              getImportIdentifier(
                ctx,
                path,
                TRACKED_IMPORTS.block[ctx.serverMode],
              ),
              [
                t.functionExpression(
                  decl.id,
                  decl.params,
                  decl.body,
                  decl.generator,
                  decl.async,
                ),
              ],
            ),
          ),
        ]),
      )[0];
      program.scope.registerDeclaration(newPath);
      newPath.skip();
      if (path.parentPath.isExportNamedDeclaration()) {
        path.parentPath.replaceWith(
          t.exportNamedDeclaration(undefined, [
            t.exportSpecifier(decl.id, decl.id),
          ]),
        );
      } else if (path.parentPath.isExportDefaultDeclaration()) {
        path.replaceWith(decl.id);
      } else {
        path.remove();
      }
    }
  }
}

function isValidFunction(
  node: t.Node,
): node is t.ArrowFunctionExpression | t.FunctionExpression {
  return t.isArrowFunctionExpression(node) || t.isFunctionExpression(node);
}

function transformVariableDeclarator(
  ctx: StateContext,
  program: babel.NodePath<t.Program>,
  path: babel.NodePath<t.VariableDeclarator>,
): void {
  if (
    path.parentPath.isVariableDeclaration() &&
    !isStatementTopLevel(path.parentPath)
  ) {
    return;
  }
  if (shouldBeIgnored(path)) {
    return;
  }
  const identifier = path.node.id;
  if (!t.isIdentifier(identifier)) {
    return;
  }
  const init = path.get('init');
  if (isComponentishName(identifier.name) && init.node) {
    const trueFuncExpr = unwrapNode(init.node, isValidFunction);
    // Check for valid FunctionExpression or ArrowFunctionExpression
    if (
      trueFuncExpr &&
      // Must not be async or generator
      !(trueFuncExpr.async || trueFuncExpr.generator) &&
      // Might be component-like, but the only valid components
      t.isIdentifier(identifier) &&
      isComponentishName(identifier.name) &&
      // have zero or one parameter
      trueFuncExpr.params.length < 2 &&
      // For RSC, only transform if it's a client component
      (ctx.options.rsc
        ? ctx.topLevelRSC ||
          (t.isBlockStatement(trueFuncExpr.body) &&
            isUseClient(trueFuncExpr.body.directives))
        : true) &&
      // Check if the function should be transformed
      shouldTransform(ctx, identifier.name, path)
    ) {
      path.node.init = t.callExpression(
        getImportIdentifier(ctx, path, TRACKED_IMPORTS.block[ctx.serverMode]),
        [trueFuncExpr],
      );
    }
  }
}

function transformCallExpression(
  ctx: StateContext,
  path: babel.NodePath<t.CallExpression>,
): void {
  if (shouldBeIgnored(path)) {
    return;
  }
  const definition = getValidImportDefinition(ctx, path.get('callee'));
  if (definition === REACT_IMPORTS.memo[ctx.serverMode]) {
    const args = path.get('arguments');
    const arg = args[0];

    const trueFuncExpr = unwrapPath(arg, isValidFunction);
    if (trueFuncExpr) {
      const descriptiveName = getDescriptiveName(trueFuncExpr, 'Anonymous');
      if (
        // For RSC, only transform if it's a client component
        (ctx.options.rsc
          ? ctx.topLevelRSC ||
            (t.isBlockStatement(trueFuncExpr.node.body) &&
              isUseClient(trueFuncExpr.node.body.directives))
          : true) &&
        shouldTransform(ctx, descriptiveName, path)
      ) {
        const root = getRootStatementPath(trueFuncExpr);
        const uid = generateUniqueName(trueFuncExpr, descriptiveName);
        root.scope.registerDeclaration(
          root.insertBefore(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                uid,
                t.callExpression(
                  getImportIdentifier(
                    ctx,
                    path,
                    TRACKED_IMPORTS.block[ctx.serverMode],
                  ),
                  [trueFuncExpr.node],
                ),
              ),
            ]),
          )[0],
        );

        trueFuncExpr.replaceWith(uid);
      }
    }
  }
}

export function transformAuto(
  ctx: StateContext,
  program: babel.NodePath<t.Program>,
): void {
  // First, identify the HOCs
  program.traverse({
    ImportDeclaration(path) {
      const mod = path.node.source.value;
      for (const importName in REACT_IMPORTS) {
        const definition = REACT_IMPORTS[importName][ctx.serverMode];
        if (definition.source === mod) {
          registerImportDefinition(ctx, path, definition);
        }
      }
    },
  });
  program.traverse({
    FunctionDeclaration(path) {
      transformFunctionDeclaration(ctx, program, path);
    },
    VariableDeclarator(path) {
      transformVariableDeclarator(ctx, program, path);
    },
    CallExpression(path) {
      transformCallExpression(ctx, path);
    },
  });
}
