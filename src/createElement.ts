import { propsDriver } from './drivers/props';
import { flushWorkStack } from './patch';
import { OLD_VNODE_FIELD, VNode } from './structs';

/**
 * Creates an Element from a VNode
 */
export const createElement = (vnode: VNode, attachField = true): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = <HTMLElement>document.createElement(vnode.tag);

  flushWorkStack(propsDriver(el, vnode, undefined, []));

  vnode.children?.forEach((child) => {
    el.appendChild(createElement(child));
  });

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
