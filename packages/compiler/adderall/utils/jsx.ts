import * as t from '@babel/types';

export const trimJSXChildren = (jsx: t.JSXElement | t.JSXFragment) => {
  for (let i = jsx.children.length - 1; i >= 0; i--) {
    const child = jsx.children[i]!;

    const isEmptyText = t.isJSXText(child) && child.value.trim() === '';
    const isEmptyExpression =
      t.isJSXExpressionContainer(child) &&
      t.isJSXEmptyExpression(child.expression);
    const isEmptyFragment =
      t.isJSXFragment(child) && child.children.length === 0;

    if (isEmptyText || isEmptyExpression || isEmptyFragment) {
      jsx.children.splice(i, 1);
    }
  }
};

export const dedupeJSXAttributes = (
  attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[],
) => {
  const seen = new Set<string>();
  for (let i = attributes.length - 1; i >= 0; i--) {
    const attr = attributes[i]!;
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      seen.has(attr.name.name)
    ) {
      attributes.splice(i, 1);
    }

    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      seen.add(attr.name.name);
    }
  }
  return attributes;
};

export const isAttributeUnsupported = (attribute: t.JSXAttribute) => {
  const UNSUPPORTED = ['tw', 'css'];
  const attributeName = attribute.name.name;
  return (
    typeof attributeName === 'string' && UNSUPPORTED.includes(attributeName)
  );
};

export const isComponent = (name: string) => {
  return (
    name[0] &&
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    name[0] === name[0].toUpperCase() &&
    !name.startsWith('_') &&
    !name.startsWith('M$') &&
    !name.startsWith('use')
  );
};
