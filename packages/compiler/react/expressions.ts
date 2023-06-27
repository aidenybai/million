// Taken from https://github.com/lxsmnsyc/forgetti/blob/main/packages/forgetti/src/core/simplify-expressions.ts

import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

type LiteralState = 'truthy' | 'falsy' | 'nullish' | 'indeterminate';

const getBooleanishState = (node: t.Expression): LiteralState => {
  switch (node.type) {
    case 'BooleanLiteral':
      return node.value ? 'truthy' : 'falsy';
    case 'NumericLiteral':
      return node.value === 0 ? 'falsy' : 'truthy';
    case 'NullLiteral':
      return 'nullish';
    case 'StringLiteral':
      return node.value === '' ? 'falsy' : 'truthy';
    case 'BigIntLiteral':
      return node.value === '0' ? 'falsy' : 'truthy';
    case 'Identifier': {
      switch (node.name) {
        case 'NaN':
          return 'falsy';
        case 'undefined':
          return 'nullish';
        case 'Infinity':
          return 'truthy';
        default:
          return 'indeterminate';
      }
    }
    // case 'ArrayExpression':
    // case 'FunctionExpression':
    // case 'ArrowFunctionExpression':
    // case 'RegExpLiteral':
    // case 'ObjectExpression':
    // case 'RecordExpression':
    // case 'TupleExpression':
    //   return 'truthy';
    case 'ParenthesizedExpression':
    case 'TypeCastExpression':
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'TSNonNullExpression':
    case 'TSTypeAssertion':
    case 'TSInstantiationExpression':
      return getBooleanishState(node.expression);
    default:
      return 'indeterminate';
  }
};

export const simplifyExpressions = (path: NodePath): void => {
  path.traverse({
    ConditionalExpression: {
      exit(p) {
        const state = getBooleanishState(p.node.test);
        if (state === 'truthy') {
          p.replaceWith(p.node.consequent);
        } else if (state !== 'indeterminate') {
          p.replaceWith(p.node.alternate);
        }
      },
    },
    LogicalExpression: {
      exit(p) {
        switch (getBooleanishState(p.node.left)) {
          case 'nullish':
            p.replaceWith(
              p.node.operator === '??' ? p.node.right : p.node.left,
            );
            break;
          case 'falsy':
            p.replaceWith(
              p.node.operator === '||' ? p.node.right : p.node.left,
            );
            break;
          case 'truthy':
            p.replaceWith(
              p.node.operator === '&&' ? p.node.right : p.node.left,
            );
            break;
          default:
            break;
        }
      },
    },
    UnaryExpression: {
      exit(p) {
        const state = getBooleanishState(p.node.argument);
        switch (p.node.operator) {
          case 'void':
            if (state !== 'indeterminate') {
              p.replaceWith(t.identifier('undefined'));
            }
            break;
          case '!':
            if (state === 'truthy') {
              p.replaceWith(t.booleanLiteral(false));
            } else if (state !== 'indeterminate') {
              p.replaceWith(t.booleanLiteral(true));
            }
            break;
          default:
            break;
        }
      },
    },
    IfStatement: {
      exit(p) {
        const state = getBooleanishState(p.node.test);
        if (state === 'truthy') {
          p.replaceWith(p.node.consequent);
        } else if (state === 'indeterminate') {
          // TODO Should simplify IfStatement?
        } else if (p.node.alternate) {
          p.replaceWith(p.node.alternate);
        } else {
          p.remove();
        }
      },
    },
    WhileStatement: {
      exit(p) {
        if (getBooleanishState(p.node.test) === 'falsy') {
          p.remove();
        }
      },
    },
  });
  path.scope.crawl();
};
