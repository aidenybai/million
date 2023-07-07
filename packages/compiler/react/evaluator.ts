// Basically copied from Tamagui: https://github.com/tamagui/tamagui/blob/66472fb262c5d0d319e85dd47e80a3a1193157f5/packages/static/src/extractor/createEvaluator.ts

// Copyright (c) 2020 Nate Wienert

import vm from 'vm';
import generate from '@babel/generator';
import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export const evaluate = (
  ast: t.Node,
  scope: NodePath<t.Node>['scope'],
  excludeIds?: string[],
) => {
  try {
    return {
      ast: valueToAst(evaluateUnsafe(ast, scope, excludeIds)),
      err: false,
    };
  } catch (_err) {
    return { ast, err: true };
  }
};

export const getVmValue = (ast: t.Node, staticContext: Record<string, any>) => {
  const code = generate(ast).code;
  const script = new vm.Script(code);
  const context = vm.createContext(staticContext);
  const result = script.runInContext(context);

  return result;
};

export const evaluateUnsafe = (
  ast: t.Node,
  scope: NodePath<t.Node>['scope'],
  excludeIds: string[] = [],
) => {
  const bindings: Record<string, any> = scope.getAllBindings() as any;
  const staticContext: Record<string, any> = {};
  for (const key in bindings) {
    try {
      if (excludeIds.includes(key)) continue;
      const node = bindings[key].path.node;
      if (bindings[key].kind === 'const' || bindings[key].kind === 'let') {
        staticContext[key] = evaluateAstNode(node.init, staticContext);
      }
      if (t.isFunctionDeclaration(node) || t.isClassDeclaration(node)) {
        staticContext[key] = evaluateAstNode(node.body, staticContext);
      }
    } catch (_err) {
      /**/
    }
  }

  return getVmValue(ast, staticContext);
};

export const evaluateAstNode = (
  ast: t.Node | undefined | null,
  staticContext: Record<string, any> = {},
): any => {
  if (!ast) return undefined;

  if (t.isJSXExpressionContainer(ast)) {
    return evaluateAstNode(ast.expression, staticContext);
  }

  if (t.isObjectExpression(ast)) {
    const ret: Record<string, any> = {};
    for (let i = -1, len = ast.properties.length; ++i < len; ) {
      const value = ast.properties[i];

      if (!t.isObjectProperty(value)) {
        throw new Error('evaluateAstNode can only evaluate object properties');
      }

      let key: string | number | null | undefined | boolean;
      if (value.computed) {
        key = evaluateAstNode(value.key, staticContext);
      } else if (t.isIdentifier(value.key)) {
        key = value.key.name;
      } else if (
        t.isStringLiteral(value.key) ||
        t.isNumericLiteral(value.key)
      ) {
        key = value.key.value;
      }

      if (!key || key === true) continue;

      ret[key] = evaluateAstNode(value.value, staticContext);
    }
    return ret;
  }

  if (t.isArrayExpression(ast)) {
    return ast.elements.map((x) => {
      return evaluateAstNode(x as any, staticContext);
    });
  }

  if (t.isUnaryExpression(ast) && ast.operator === '-') {
    const ret = evaluateAstNode(ast.argument, staticContext);
    if (ret === null || ret === undefined) {
      return null;
    }
    return -ret;
  }

  if (t.isTemplateLiteral(ast)) {
    let ret = '';
    for (let idx = -1, len = ast.quasis.length; ++idx < len; ) {
      const quasi = ast.quasis[idx]!;
      const expr = ast.expressions[idx];
      ret += quasi.value.raw;
      if (expr) {
        ret += evaluateAstNode(expr, staticContext);
      }
    }
    return ret;
  }

  if (t.isNullLiteral(ast)) return null;

  if (
    t.isNumericLiteral(ast) ||
    t.isStringLiteral(ast) ||
    t.isBooleanLiteral(ast)
  ) {
    return ast.value;
  }

  if (t.isBinaryExpression(ast)) {
    if (ast.operator === '+') {
      const left = evaluateAstNode(ast.left, staticContext) as number;
      const right = evaluateAstNode(ast.right, staticContext) as number;
      return left + right;
    } else if (ast.operator === '-') {
      return (
        evaluateAstNode(ast.left, staticContext) -
        evaluateAstNode(ast.right, staticContext)
      );
    } else if (ast.operator === '*') {
      return (
        evaluateAstNode(ast.left, staticContext) *
        evaluateAstNode(ast.right, staticContext)
      );
    } else if (ast.operator === '/') {
      return (
        evaluateAstNode(ast.left, staticContext) /
        evaluateAstNode(ast.right, staticContext)
      );
    }
  }

  return getVmValue(ast, staticContext);
};

export const valueToAst = (value: unknown) => {
  switch (typeof value) {
    case 'number':
      return t.numericLiteral(value);
    case 'string':
      return t.stringLiteral(value);
    case 'boolean':
      return t.booleanLiteral(value);
    case 'undefined':
      return t.unaryExpression('void', t.numericLiteral(0), true);
    case 'object':
      if (value === null) {
        return t.nullLiteral();
      } else if (Array.isArray(value)) {
        return t.arrayExpression(value.map(valueToAst));
      }
      return t.objectExpression(
        Object.entries(value).map(([key, value]) =>
          t.objectProperty(t.identifier(key), valueToAst(value)),
        ),
      );
    default:
      throw new Error(`Cannot convert value to AST: ${String(value)}`);
  }
};
