import { OLD_VNODE_FIELD } from './constants';
import { VNode } from './structs';

/**
 * Creates an element from a VNode
 * @param {VNode} vnode - VNode to convert to HTMLElement or Text
 * @param {boolean} attachField - Attach OLD_VNODE_FIELD
 * @returns {HTMLElement|Text}
 */
export const createElement = (vnode: VNode, attachField = true): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode.tag);

  if (vnode.props) {
    for (const name of Object.keys(vnode.props)) {
      el[name] = vnode.props[name];
    }
  }

  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; ++i) {
      el.appendChild(createElement(vnode.children[i]));
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
