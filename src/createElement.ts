import { propsDriver } from './drivers/props';
import { flushWorkStack } from './patch';
import { DOMNode, OLD_VNODE_FIELD, VNode } from './types/base';

const patchProps = propsDriver();

/**
 * Creates an Element from a VNode
 */
export const createElement = (vnode: VNode, attachField = true): DOMNode => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);

  const el = vnode.props?.ns
    ? <SVGElement>document.createElementNS(<string>vnode.props?.ns, vnode.tag)
    : <HTMLElement>document.createElement(vnode.tag);

  flushWorkStack(patchProps(el, vnode).workStack);

  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; ++i) {
      el.appendChild(createElement(vnode.children[i]));
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
