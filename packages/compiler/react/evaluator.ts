// Basically copied from Tamagui: https://github.com/tamagui/tamagui/blob/66472fb262c5d0d319e85dd47e80a3a1193157f5/packages/static/src/extractor/createEvaluator.ts

// MIT License
//
// Copyright (c) 2020 Nate Wienert
// Copyright (c) 2015-present, Nicolas Gallagher.
// Copyright (c) 2015-present, Facebook, Inc.
// Copyright (c) 2021 Radix
// Copyright (c) 2017 Carmelo Pullara
// Copyright (c) 2018 Framer B.V.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import vm from 'vm';
import generate from '@babel/generator';
import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

type StaticContext = Record<string, any>;

export const evaluate = (
  ast: t.Node,
  scope: NodePath['scope'],
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

export const evaluateUnsafe = (
  ast: t.Node,
  scope: NodePath['scope'],
  excludeIds: string[] = [],
) => {
  const bindings = scope.getAllBindings();
  const staticContext: StaticContext = {};
  for (const key in bindings) {
    try {
      if (excludeIds.includes(key)) continue;
      const { path, kind } = bindings[key]!;
      if (
        (kind === 'const' || kind === 'let') &&
        t.isVariableDeclarator(path.node)
      ) {
        staticContext[key] = evaluateAstNode(path.node.init, staticContext);
      }
      if (
        t.isFunctionDeclaration(path.node) ||
        t.isClassDeclaration(path.node)
      ) {
        staticContext[key] = evaluateAstNode(path.node.body, staticContext);
      }
    } catch (_err) {
      /**/
    }
  }

  return runAstInContext(ast, staticContext);
};

export const runAstInContext = (ast: t.Node, staticContext: StaticContext) => {
  const code = generate(ast).code;
  const script = new vm.Script(code);
  const context = vm.createContext(staticContext);
  const result = script.runInContext(context);

  return result;
};

export const evaluateAstNode = (
  ast: t.Node | undefined | null,
  staticContext: StaticContext = {},
): any => {
  if (!ast) return undefined;

  if (t.isJSXExpressionContainer(ast)) {
    return evaluateAstNode(ast.expression, staticContext);
  }

  if (t.isObjectExpression(ast)) {
    const ret: StaticContext = {};
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
      return evaluateAstNode(x, staticContext);
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
    const left = evaluateAstNode(ast.left, staticContext);
    const right = evaluateAstNode(ast.right, staticContext);
    if (typeof left === 'number' && typeof right === 'number') {
      return evaluateBinaryExpression(left, right, ast.operator);
    }
  }

  return runAstInContext(ast, staticContext);
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

function evaluateBinaryExpression(
  left: number,
  right: number,
  operator: t.BinaryExpression['operator'],
): any {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    case '<':
      return left < right;
    case '>':
      return left > right;
    case '<=':
      return left <= right;
    case '>=':
      return left >= right;
    case '==':
      // eslint-disable-next-line eqeqeq
      return left == right;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return left != right;
    case '===':
      return left === right;
    case '!==':
      return left !== right;
    default:
      return undefined;
  }
}
