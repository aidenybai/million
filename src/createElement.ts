import { VNode } from './m';
import { OLD_VNODE_FIELD } from './patch';

/**
 * Creates an element from a Virtual Node
 * @param {VNode} vnode - Virtual Node to convert to HTMLElement or Text
 * @returns {HTMLElement|Text}
 */
export const createElement = (vnode: VNode, attachFlag = true): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode.tag);

  if (vnode.props) {
    for (const name of Object.keys(vnode.props)) {
      el[name] = vnode.props[name];
    }
  }

  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; i++) {
      el.appendChild(createElement(vnode.children[i]));
    }
  }

  if (attachFlag) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
