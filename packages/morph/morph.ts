import { patch } from '../million/render';
import { DOMNode, Hook } from '../million/types';
import { memo } from './memo';
import { fromDomNodeToVNode } from '../shared';

/**
 * Patches two DOM nodes and modifies the DOM node based on the necessary changes
 */
export const morph = (
  newDOMNode: DOMNode | string,
  oldDOMNode: DOMNode,
  hook: Hook = () => true,
): DOMNode =>
  patch(
    oldDOMNode,
    typeof newDOMNode === 'string' ? memo(newDOMNode) : fromDomNodeToVNode(newDOMNode),
    fromDomNodeToVNode(oldDOMNode),
    hook,
  );
