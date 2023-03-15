import generator from '@babel/generator';
import { addNamed } from '@babel/helper-module-imports';
import {
  arrayExpression,
  arrowFunctionExpression,
  binaryExpression,
  blockStatement,
  booleanLiteral,
  callExpression,
  identifier,
  isArrowFunctionExpression,
  isIdentifier,
  isJSXAttribute,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isJSXText,
  isNumericLiteral,
  isObjectExpression,
  isObjectPattern,
  isObjectProperty,
  isStringLiteral,
  isVariableDeclarator,
  jsxAttribute,
  jsxText,
  logicalExpression,
  memberExpression,
  newExpression,
  nullLiteral,
  numericLiteral,
  optionalMemberExpression,
  returnStatement,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types';
import { X_CHAR } from '../million/constants';
import type {
  ArrowFunctionExpression,
  BinaryExpression,
  CallExpression,
  Identifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXFragment,
  JSXSpreadAttribute,
  JSXSpreadChild,
  JSXText,
  LogicalExpression,
  NumericLiteral,
  ObjectPattern,
  ObjectProperty,
  ArrayExpression,
} from '@babel/types';
import type { NodePath } from '@babel/core';
import type { AstEdit, AstEditBase } from './types';

export const renderToTemplate = (
  node: JSXElement,
  edits: AstEdit[],
  path: NumericLiteral[] = [],
  holes: string[] = [],
) => {
  const attributesLength = node.openingElement.attributes.length;
  const current: AstEdit = {
    path, // The location of the edit in in the virtual node tree
    edits: [], // Occur on mount + patch
    inits: [], // Occur before mount
  };
  if (attributesLength) {
    const newAttributes: (JSXAttribute | JSXSpreadAttribute)[] = [];
    for (let i = 0; i < attributesLength; ++i) {
      const attribute = node.openingElement.attributes[i];
      if (
        isJSXAttribute(attribute) &&
        isJSXIdentifier(attribute.name) &&
        attribute.value
      ) {
        const name = attribute.name.name;
        if (name === 'key' || name === 'ref' || name === 'children') {
          continue;
        }
        if (name === 'className') attribute.name.name = 'class';
        if (name === 'htmlFor') attribute.name.name = 'for';
        if (name.startsWith('on')) {
          // We assume that the value is a function, so it must always be an expression;
          if (!isJSXExpressionContainer(attribute.value)) continue;
          const { expression } = attribute.value;
          if (
            !isIdentifier(expression) &&
            !isArrowFunctionExpression(expression)
          ) {
            continue;
          }
          // Make objects monomorphic
          current.edits.push({
            type: stringLiteral('event'),
            listener: isArrowFunctionExpression(expression)
              ? expression
              : undefined,
            name: stringLiteral(name),
            hole: isIdentifier(expression)
              ? stringLiteral(expression.name)
              : undefined,
            value: undefined,
            index: undefined,
          });

          continue;
        }
        if (name === 'style') {
          if (!isJSXExpressionContainer(attribute.value)) continue;
          const { expression } = attribute.value;
          if (!isObjectExpression(expression)) continue;
          let style = '';
          for (let i = 0, j = expression.properties.length; i < j; ++i) {
            const property = expression.properties[i];
            if (
              !isObjectProperty(property) ||
              !isIdentifier(property.key) ||
              (!isStringLiteral(property.value) &&
                !isNumericLiteral(property.value))
            )
              continue;
            if (!isIdentifier(property.key)) continue;
            const value = property.value.extra?.raw || '';
            style += `${property.key.name}:${String(value)};`;
          }
          attribute.value = stringLiteral(style);
          continue;
        }
        if (isJSXExpressionContainer(attribute.value)) {
          // TODO handle interpolations {foo + 1}
          if (
            isStringLiteral(attribute.value.expression) ||
            isNumericLiteral(attribute.value.expression)
          ) {
            newAttributes.push(
              jsxAttribute(
                attribute.name,
                stringLiteral(String(attribute.value.expression.value)),
              ),
            );
            continue;
          }
          const { expression } = attribute.value;
          current.edits.push({
            type: stringLiteral(
              name === 'style'
                ? 'style'
                : name.charCodeAt(0) === X_CHAR
                ? 'svg'
                : 'attribute',
            ),
            hole: isIdentifier(expression)
              ? stringLiteral(expression.name)
              : undefined,
            name: stringLiteral(name),
            listener: undefined,
            value: undefined,
            index: undefined,
          });
          continue;
        }
      }
      newAttributes.push(attribute!);
    }
    node.openingElement.attributes = newAttributes;
  }

  const newChildren: (
    | JSXElement
    | JSXText
    | JSXExpressionContainer
    | JSXSpreadChild
    | JSXFragment
  )[] = [];
  for (let i = 0, j = node.children.length || 0, k = 0; i < j; ++i) {
    const child = node.children[i];

    if (
      isJSXExpressionContainer(child) &&
      isIdentifier(child.expression) &&
      holes.includes(child.expression.name)
    ) {
      current.edits.push({
        type: stringLiteral('child'),
        hole: stringLiteral(child.expression.name),
        index: numericLiteral(i),
        name: undefined,
        listener: undefined,
        value: undefined,
      });
      continue;
    }

    if (
      isJSXText(child) &&
      (typeof child.value === 'string' ||
        typeof child.value === 'number' ||
        typeof child.value === 'bigint')
    ) {
      newChildren.push(jsxText(String(child.value)));
      k++;
      continue;
    }

    if (isJSXElement(child)) {
      newChildren.push(
        renderToTemplate(child, edits, [...path, numericLiteral(k++)], holes),
      );
    }
  }
  node.children = newChildren;

  if (current.edits.length) {
    edits.push(current);
  }

  return node;
};

export const handleBlock = (path: NodePath<CallExpression>) => {
  if (isIdentifier(path.node.callee, { name: 'block' })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction) return;
    const importSource = blockFunction.path.parent;
    if (
      !isVariableDeclarator(path.parentPath.node) ||
      importSource.type !== 'ImportDeclaration' ||
      // Currently uses includes. Fix this because million/react could be included
      !importSource.source.value.includes('million')
    ) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let [component, shouldUpdate] = path.node.arguments;
    if (!component) return;
    const [props] = (component as ArrowFunctionExpression).params as (
      | ObjectPattern
      | Identifier
    )[];

    if (isArrowFunctionExpression(component) && isJSXElement(component.body)) {
      const edits: AstEdit[] = [];

      const holes = isObjectPattern(props)
        ? Object.keys(props.properties).map((key) => {
            return props.properties[key].key.name;
          })
        : [];

      const template = renderToTemplate(component.body, edits, [], holes);

      const editsArray = arrayExpression(
        edits.map((edit) => {
          const editsLength = edit.edits.length;
          const properties: ArrayExpression[] = Array(editsLength);

          for (let i = 0; i < editsLength; ++i) {
            const { type, name, hole, listener, value, index } = edit.edits[
              i
            ] as AstEditBase;
            // babel create null value with ast

            properties[i] = arrayExpression([
              type,
              name ?? nullLiteral(),
              value ?? nullLiteral(),
              hole ?? nullLiteral(),
              index ?? nullLiteral(),
              listener ?? nullLiteral(),
              nullLiteral(),
              nullLiteral(),
            ]);
          }

          return arrayExpression([
            arrayExpression(edit.path),
            arrayExpression(properties),
            null,
          ]);
        }),
      );

      const stringToDOM = addNamed(
        path,
        'stringToDOM',
        importSource.source.value,
        {
          nameHint: 'stringToDOM$',
        },
      );

      if (!shouldUpdate && props && !isIdentifier(props)) {
        const { properties } = props;
        shouldUpdate = arrowFunctionExpression(
          [identifier('oldProps'), identifier('newProps')],
          chainLogicalExpressions(
            ...properties
              .filter((property) => isObjectProperty(property))
              .map((property) => {
                const key = (property as ObjectProperty).key as Identifier;
                return binaryExpression(
                  '!==',
                  optionalMemberExpression(
                    identifier('oldProps'),
                    key,
                    false,
                    true,
                  ),
                  optionalMemberExpression(
                    identifier('newProps'),
                    key,
                    false,
                    true,
                  ),
                );
              }),
          ),
        );
      }

      const domVariable = path.scope.generateUidIdentifier('dom$');
      const editsVariable = path.scope.generateUidIdentifier('edits$');
      const shouldUpdateVariable =
        path.scope.generateUidIdentifier('shouldUpdate$');

      const variables = variableDeclaration('const', [
        variableDeclarator(
          domVariable,
          callExpression(stringToDOM, [
            stringLiteral(generator(template).code),
          ]),
        ),
        variableDeclarator(editsVariable, editsArray),
        variableDeclarator(
          shouldUpdateVariable,
          isArrowFunctionExpression(shouldUpdate)
            ? shouldUpdate
            : arrowFunctionExpression([], booleanLiteral(true)),
        ),
      ]);
      const BlockClass = addNamed(path, 'Block', importSource.source.value, {
        nameHint: 'Block$',
      });

      const blockFactory = arrowFunctionExpression(
        [identifier('props'), identifier('key'), identifier('shouldUpdate')],
        blockStatement([
          returnStatement(
            newExpression(BlockClass, [
              domVariable,
              editsVariable,
              identifier('props'),
              logicalExpression(
                '??',
                identifier('key'),
                memberExpression(identifier('props'), identifier('key')),
              ),
              logicalExpression(
                '??',
                identifier('shouldUpdate'),
                shouldUpdateVariable,
              ),
            ]),
          ),
        ]),
      );

      path.parentPath.parentPath?.insertBefore(variables);
      path.replaceWith(returnStatement(blockFactory));
    }
  }
};

const chainLogicalExpressions = (
  ...binaryExpressions: BinaryExpression[]
): LogicalExpression | BinaryExpression => {
  if (binaryExpressions.length === 1) {
    return binaryExpressions[0]!;
  }

  const [first, ...rest] = binaryExpressions;

  return logicalExpression(
    '||',
    first as BinaryExpression,
    chainLogicalExpressions(...rest),
  );
};
