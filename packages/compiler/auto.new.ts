import type * as babel from '@babel/core';
import * as t from '@babel/types';
import { IMPORTS, REACT_IMPORTS } from './constants.new';
import type { StateContext } from './types';
import { isComponentishName, isStatementTopLevel } from './utils/checks';
import { generateUniqueName } from './utils/generate-unique-name';
import { getDescriptiveName } from './utils/get-descriptive-name';
import { getImportIdentifier } from './utils/get-import-specifier';
import { getRootStatementPath } from './utils/get-root-statement-path';
import { getValidImportDefinition } from './utils/get-valid-import-definition';
import { registerImportDefinition } from './utils/register-import-definition';
import { unwrapNode } from './utils/unwrap-node';
import { unwrapPath } from './utils/unwrap-path';
import { isAttributeUnsupported } from './utils/jsx';
import { logImprovement } from './utils/log';

function shouldTransform(
  ctx: StateContext,
  name: string,
  path: babel.NodePath,
): boolean {
  let bailout = false;

  let elements = 0;
  let attributes = 0;
  let components = 0;
  let text = 0;
  let expressions = 0;
  let returns = 0;

  path.traverse({
    JSXElement(innerPath) {
      const type = innerPath.node.openingElement.name;
      if (t.isJSXMemberExpression(type)) {
        const isContext =
          t.isJSXIdentifier(type.object) &&
          isComponentishName(type.property.name) &&
          type.property.name === 'Provider';
        const isSpecialElement = t.isJSXIdentifier(type.object);

        if (isContext) {
          bailout = true;
          innerPath.stop();
          return;
        }

        if (isSpecialElement) {
          components++;
          innerPath.skip();
          return;
        }
      }
      if (t.isJSXIdentifier(type) && isComponentishName(type.name)) {
        components++;
        innerPath.skip();
        return;
      }

      elements++;
    },
    JSXSpreadChild(innerPath) {
      components++;
      innerPath.skip();
    },
    JSXExpressionContainer(path) {
      if (t.isJSXEmptyExpression(path.node.expression)) return;

      if (
        t.isCallExpression(path.node.expression) &&
        t.isMemberExpression(path.node.expression.callee) &&
        t.isIdentifier(path.node.expression.callee.property, { name: 'map' })
      ) {
        return;
      }

      if (t.isConditionalExpression(path.node.expression)) {
        components++;
        path.skip();
        return;
      }

      if (!t.isLiteral(path.node.expression)) expressions++;
      if (!t.isJSXAttribute(path.parent)) path.skip();
    },
    JSXSpreadAttribute(path) {
      components++;
      path.skip();
    },
    JSXAttribute(path) {
      const attribute = path.node;
      // twin.macro + styled-components / emotion support
      if (isAttributeUnsupported(attribute) || attribute.name.name === 'ref') {
        components++;
        path.skip();
        return;
      }
      if (!t.isLiteral(attribute.value)) attributes++;
    },
    JSXText(path) {
      if (path.node.value.trim() !== '') text++;
    },
    ReturnStatement(innerPath) {
      if (innerPath.scope.uid !== path.scope.uid) return;
      returns++;
      if (returns > 1) {
        bailout = true;
        innerPath.stop();
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (bailout) return false;

  const good = elements + attributes + text;

  if (good < 5) return false;

  const bad = components + expressions;
  const improvement = (good - bad) / (good + bad);

  if (isNaN(improvement) || !isFinite(improvement)) return false;

  const threshold =
    typeof ctx.auto === 'object' && ctx.auto.threshold
      ? ctx.auto.threshold
      : 0.1;

  if (improvement <= threshold) return false;
  if (!ctx.log || ctx.log === 'info') {
    logImprovement(
      name,
      improvement,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      !ctx.log || ctx.log === 'info',
      ctx.telemetry,
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
                IMPORTS.block[ctx.server ? 'server' : 'client'],
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
      // Check if the function should be transformed
      shouldTransform(ctx, identifier.name, path)
    ) {
      path.node.init = t.callExpression(
        getImportIdentifier(
          ctx,
          path,
          IMPORTS.block[ctx.server ? 'server' : 'client'],
        ),
        [trueFuncExpr],
      );
    }
  }
}

function transformCallExpression(
  ctx: StateContext,
  path: babel.NodePath<t.CallExpression>,
): void {
  const definition = getValidImportDefinition(ctx, path.get('callee'));
  if (definition === REACT_IMPORTS.memo[ctx.server ? 'server' : 'client']) {
    const args = path.get('arguments');
    const arg = args[0];

    const trueFuncExpr = unwrapPath(arg, isValidFunction);
    if (trueFuncExpr) {
      const root = getRootStatementPath(trueFuncExpr);
      const descriptiveName = getDescriptiveName(path, 'Anonymous');
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
                  IMPORTS.block[ctx.server ? 'server' : 'client'],
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

export function transformAuto(
  ctx: StateContext,
  program: babel.NodePath<t.Program>,
): void {
  // First, identify the HOCs
  program.traverse({
    ImportDeclaration(path) {
      const mod = path.node.source.value;
      for (const importName in REACT_IMPORTS) {
        const definition =
          REACT_IMPORTS[importName][ctx.server ? 'server' : 'client'];
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
