import * as t from '@babel/types';
import { RENDER_SCOPE } from '../constants';

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
    !name.startsWith('use')
  );
};

export const isJSXFragment = (
  node: t.Node | null | undefined,
): node is t.JSXFragment | t.JSXElement => {
  if (!t.isJSXElement(node)) return t.isJSXFragment(node);

  const type = node.openingElement.name;
  return (
    (t.isJSXMemberExpression(type) && type.property.name === 'Fragment') ||
    (t.isJSXIdentifier(type) && type.name === 'Fragment')
  );
};

export const isSensitiveJSXElement = (jsx: t.JSXElement) => {
  // elements that break when the children are not in a specific format
  const SENSITIVE_ELEMENTS = ['select'];

  const type = jsx.openingElement.name;

  return t.isJSXIdentifier(type) && SENSITIVE_ELEMENTS.includes(type.name);
};

export const isStaticAttributeValue = (node: t.Node) => {
  if (
    t.isTaggedTemplateExpression(node) &&
    t.isIdentifier(node.tag) &&
    node.quasi.expressions.length === 0 &&
    node.tag.name === 'css'
  ) {
    return true;
  }
  return t.isLiteral(node) && !t.isTemplateLiteral(node);
};

/**
 * Turns top-level JSX fragments into a render scope. This is because
 * the runtime API does not currently handle fragments. We will deal with
 * nested fragments later.
 *
 * ```js
 * function Component() {
 *  return <>
 *   <div />
 *  </>;   * }
 *
 * // becomes
 *
 * function Component() {
 *  return <slot>
 *    <div />
 *  </slot>;
 * }
 * ```
 */
export const handleTopLevelFragment = (returnStatement: t.ReturnStatement) => {
  const jsx = returnStatement.argument as t.JSXElement | t.JSXFragment;
  trimJSXChildren(jsx);

  if (jsx.children.length !== 1) {
    const renderScopeId = t.jsxIdentifier(RENDER_SCOPE);
    returnStatement.argument = t.jsxElement(
      t.jsxOpeningElement(renderScopeId, []),
      t.jsxClosingElement(renderScopeId),
      jsx.children,
    );
    return;
  }

  const child = jsx.children[0];
  if (t.isJSXElement(child)) {
    returnStatement.argument = child;
  }

  if (t.isJSXExpressionContainer(child)) {
    if (t.isJSXEmptyExpression(child.expression)) {
      returnStatement.argument = t.nullLiteral();
    } else {
      returnStatement.argument = child.expression;
    }
  }

  if (isJSXFragment(child)) {
    handleTopLevelFragment(child, returnStatement);
  }
};
