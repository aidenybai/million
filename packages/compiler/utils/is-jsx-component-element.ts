import type * as babel from '@babel/core';
import * as t from '@babel/types';
import { isPathValid } from './checks';
import { isAttributeUnsupported } from './jsx';

export function isJSXComponentElement(
  path: babel.NodePath<t.JSXElement>,
): boolean {
  const openingElement = path.get('openingElement');
  const name = openingElement.get('name');
  /**
   * Only valid component elements are member expressions and identifiers
   * starting with component-ish name
   */
  if (isPathValid(name, t.isJSXMemberExpression)) {
    return true;
  }
  if (isPathValid(name, t.isJSXIdentifier)) {
    if (/^[A-Z_]/.test(name.node.name)) {
      return true;
    }
  }
  const attributes = openingElement.get('attributes');
  for (let i = 0, len = attributes.length; i < len; i++) {
    const attr = attributes[i];
    if (isPathValid(attr, t.isJSXAttribute)) {
      if (isAttributeUnsupported(attr.node) || attr.node.name.name === 'ref') {
        return true;
      }
    }
  }
  return false;
}
