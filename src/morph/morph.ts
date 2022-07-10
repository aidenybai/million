import { patch } from '../million/render';
import { memo } from './memo';
import type { DOMNode } from '../million/types';

/**
 * Patches two DOM nodes and modifies the DOM node based on the necessary changes
 */
export const morph = (
  newDOMNode: DOMNode | string,
  oldDOMNode: DOMNode,
): DOMNode => {
  return patch(oldDOMNode, memo(newDOMNode), memo(oldDOMNode));
};
