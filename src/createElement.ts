import { OLD_VNODE_FIELD, VNode } from './structs';

/**
 * Creates an element from a VNode
 * @param {VNode} vnode - VNode to convert to HTMLElement or Text
 * @param {boolean} attachField - Attach OLD_VNODE_FIELD
 * @returns {HTMLElement|Text}
 */
export const createElement = (vnode: VNode, attachField = true): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = <HTMLElement>Object.assign(document.createElement(vnode.tag), vnode.props);

  vnode.children?.forEach((child) => {
    el.appendChild(createElement(child));
  });

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
