import * as t from '@babel/types';
import {
  X_CHAR,
  EventFlag,
  StyleAttributeFlag,
  SvgAttributeFlag,
  AttributeFlag,
  ChildFlag,
} from '../million/constants';
import type { IrEdit } from './types';

export const renderToString = (node: t.JSXElement) => {
  const type = node.openingElement.name as t.JSXIdentifier;
  const attributes = node.openingElement.attributes;

  let html = `<${type.name}`;

  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i];
    if (
      !t.isJSXSpreadAttribute(attribute) &&
      attribute?.value &&
      t.isJSXIdentifier(attribute.name) &&
      'value' in attribute.value
    ) {
      const { name } = attribute.name;
      const { value } = attribute.value;
      html += ` ${name}${value ? `="${value}"` : ''}`;
    }
  }

  if (node.selfClosing) {
    html += ` />`;
    return html;
  }
  html += '>';
  if (node.children.length) {
    for (let i = 0, j = node.children.length; i < j; i++) {
      const child = node.children[i];
      if (t.isJSXText(child)) {
        html += child.value.trim();
      } else if (t.isJSXElement(child)) {
        html += renderToString(child);
      } else if (t.isJSXExpressionContainer(child)) {
        if (t.isStringLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t.isNumericLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t.isJSXElement(child.expression)) {
          html += renderToString(child.expression);
        }
      }
    }
  }
  html += `</${type.name}>`;
  return html;
};

export const renderToTemplate = (
  node: t.JSXElement,
  edits: IrEdit[],
  path: number[] = [],
  holes: string[] = [],
) => {
  const attributesLength = node.openingElement.attributes.length;
  const current: IrEdit = {
    path, // The location of the edit in in the virtual node tree
    edits: [], // Occur on mount + patch
    inits: [], // Occur before mount
  };
  if (attributesLength) {
    const newAttributes: (t.JSXAttribute | t.JSXSpreadAttribute)[] = [];
    for (let i = 0; i < attributesLength; ++i) {
      const attribute = node.openingElement.attributes[i];
      if (
        t.isJSXAttribute(attribute) &&
        t.isJSXIdentifier(attribute.name) &&
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
          if (!t.isJSXExpressionContainer(attribute.value)) continue;
          const { expression } = attribute.value;
          if (
            !t.isIdentifier(expression) &&
            !t.isArrowFunctionExpression(expression)
          ) {
            continue;
          }
          const isDynamicListener =
            t.isIdentifier(expression) && holes.includes(expression.name);

          const event = name.toLowerCase().slice(2);
          if (isDynamicListener) {
            current.edits.push({
              type: t.numericLiteral(EventFlag),
              name: t.stringLiteral(event),
              hole: t.stringLiteral(expression.name),
            });
          } else {
            current.inits.push({
              type: t.numericLiteral(EventFlag),
              listener: expression,
              name: t.stringLiteral(event),
            });
          }

          continue;
        }
        if (name === 'style') {
          if (!t.isJSXExpressionContainer(attribute.value)) continue;
          const { expression } = attribute.value;
          if (!t.isObjectExpression(expression)) continue;
          let style = '';
          for (let i = 0, j = expression.properties.length; i < j; ++i) {
            const property = expression.properties[i];
            if (
              !t.isObjectProperty(property) ||
              !t.isIdentifier(property.key) ||
              (!t.isStringLiteral(property.value) &&
                !t.isNumericLiteral(property.value))
            )
              continue;
            if (!t.isIdentifier(property.key)) continue;
            const value = property.value.extra?.raw || '';
            style += `${property.key.name}:${String(value)};`;
          }
          attribute.value = t.stringLiteral(style);
          continue;
        }
        if (t.isJSXExpressionContainer(attribute.value)) {
          // TODO handle interpolations {foo + 1}
          if (
            t.isStringLiteral(attribute.value.expression) ||
            t.isNumericLiteral(attribute.value.expression)
          ) {
            newAttributes.push(
              t.jsxAttribute(
                attribute.name,
                t.stringLiteral(String(attribute.value.expression.value)),
              ),
            );
            continue;
          }
          const { expression } = attribute.value as { expression: any };
          current.edits.push({
            type: t.numericLiteral(
              name === 'style'
                ? StyleAttributeFlag
                : name.charCodeAt(0) === X_CHAR
                ? SvgAttributeFlag
                : AttributeFlag,
            ),
            hole: t.stringLiteral(expression.name),
            name: t.stringLiteral(name),
          });
          continue;
        }
      }
      if (
        attribute &&
        'value' in attribute &&
        attribute.value &&
        t.isJSXAttribute(attribute)
      ) {
        newAttributes.push(attribute);
      }
    }
    node.openingElement.attributes = newAttributes;
  }

  const newChildren: (
    | t.JSXElement
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXFragment
  )[] = [];
  for (let i = 0, j = node.children.length || 0, k = 0; i < j; ++i) {
    const child = node.children[i];

    if (
      t.isJSXExpressionContainer(child) &&
      t.isIdentifier(child.expression) &&
      holes.includes(child.expression.name)
    ) {
      current.edits.push({
        type: t.numericLiteral(ChildFlag),
        hole: t.stringLiteral(child.expression.name),
        index: t.numericLiteral(i),
        name: undefined,
        listener: undefined,
        value: undefined,
      });
      continue;
    }

    if (
      t.isJSXText(child) &&
      (typeof child.value === 'string' ||
        typeof child.value === 'number' ||
        typeof child.value === 'bigint')
    ) {
      const value = String(child.value);
      if (value.trim() === '') continue;
      newChildren.push(t.jsxText(value));
      k++;
      continue;
    }

    if (t.isJSXElement(child)) {
      newChildren.push(renderToTemplate(child, edits, [...path, k++], holes));
    }
  }
  node.children = newChildren;

  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }

  return node;
};
