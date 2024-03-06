import * as t from '@babel/types';

export function isGuaranteedLiteral(node: t.Expression): node is t.Literal {
  switch (node.type) {
    case 'ParenthesizedExpression':
    case 'TypeCastExpression':
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'TSNonNullExpression':
    case 'TSTypeAssertion':
    case 'TSInstantiationExpression':
      return isGuaranteedLiteral(node.expression);
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
    case 'NullLiteral':
    case 'BigIntLiteral':
    case 'RegExpLiteral':
      return true;
    case 'TemplateLiteral':
      for (let i = 0, len = node.expressions.length; i < len; i++) {
        const expr = node.expressions[i];
        if (t.isExpression(expr) && !isGuaranteedLiteral(expr)) {
          return false;
        }
      }
      return true;
    case 'UnaryExpression':
      if (node.operator === 'throw' || node.operator === 'delete') {
        return false;
      }
      return isGuaranteedLiteral(node.argument);
    case 'ConditionalExpression':
      return (
        isGuaranteedLiteral(node.test) &&
        isGuaranteedLiteral(node.consequent) &&
        isGuaranteedLiteral(node.alternate)
      );
    case 'BinaryExpression':
      if (
        node.operator === 'in' ||
        node.operator === 'instanceof' ||
        node.operator === '|>'
      ) {
        return false;
      }
      return (
        t.isExpression(node.left) &&
        isGuaranteedLiteral(node.left) &&
        t.isExpression(node.right) &&
        isGuaranteedLiteral(node.right)
      );
    case 'LogicalExpression':
      return isGuaranteedLiteral(node.left) && isGuaranteedLiteral(node.right);
    default:
      return false;
  }
}
