
import type * as babel from '@babel/core';
import * as t from '@babel/types';
import { IMPORTS } from './constants.new';
import type { StateContext } from "./types";
import { isComponentishName, isStatementTopLevel } from './utils/checks';
import { getImportIdentifier } from './utils/get-import-specifier';
import { unwrapNode } from './utils/unwrap-node';

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
      decl.params.length < 2
    ) {
      const newPath = program.unshiftContainer('body', t.variableDeclaration(
        'const',
        [t.variableDeclarator(
          decl.id,
          t.callExpression(
            getImportIdentifier(
              ctx,
              path,
              IMPORTS.block[ctx.server ? 'server' : 'client'],
            ),
            [t.functionExpression(
              decl.id,
              decl.params,
              decl.body,
              decl.generator,
              decl.async,
            )],
          ),
        )],
      ))[0];
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
  const init = path.node.init;
  if (!(init && t.isIdentifier(identifier))) {
    return;
  }
  if (isComponentishName(identifier.name)) {
    const trueFuncExpr = unwrapNode(init, isValidFunction);
    // Check for valid FunctionExpression or ArrowFunctionExpression
    if (
      trueFuncExpr &&
      // Must not be async or generator
      !(trueFuncExpr.async || trueFuncExpr.generator) &&
      // Might be component-like, but the only valid components
      // have zero or one parameter
      trueFuncExpr.params.length < 2
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

export function transformAuto(
  ctx: StateContext,
  program: babel.NodePath<t.Program>,
): void {
  program.traverse({
    FunctionDeclaration(path) {
      transformFunctionDeclaration(ctx, program, path);
    },
    VariableDeclarator(path) {
      transformVariableDeclarator(ctx, program, path);
    }
  });
}
