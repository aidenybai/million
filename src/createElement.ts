import { VNode } from './h';

export const createElement = (vnode: VNode | string): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const element = document.createElement(vnode?.tag);

  if (vnode.attributes) {
    Object.entries(vnode.attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }
  if (vnode.children) {
    vnode.children.forEach((child: VNode | string) => {
      element.appendChild(createElement(child));
    });
  }

  return element;
};