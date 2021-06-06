import { VNode } from './m';

/**
 * Creates an element from a Virtual Node
 * @param {VNode|string} vnode - Virtual Node to convert to HTMLElement or Text
 * @returns {HTMLElement|Text}
 */
export const createElement = (vnode: VNode | string): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode.tag);

  if (vnode.props) {
    Object.entries(vnode.props).forEach(([name, value]) => {
      el[name] = value;
    });
  }

  if (vnode.children) {
    vnode.children.forEach((child: VNode | string) => {
      el.appendChild(createElement(child));
    });
  }

  return el;
};
