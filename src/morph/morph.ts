import { patch } from '../million/render';
import { DOMNode, Hook } from '../million/types';
import { memo } from './memo';

/**
 * Patches two DOM nodes and modifies the DOM node based on the necessary changes
 */
export const morph = (
  newDOMNode: DOMNode | string,
  oldDOMNode: DOMNode,
  hook: Hook = () => true,
): DOMNode => {
  return patch(oldDOMNode, memo(newDOMNode), memo(oldDOMNode), hook);
};
