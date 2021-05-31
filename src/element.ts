import { VNode } from './h';

export const element = (vnode: VNode | string): HTMLElement | Text => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode?.tag);

  if (vnode.attributes) {
    Object.entries(vnode.attributes).forEach(([name, value]) => {
      el.setAttribute(name, value);
    });
  }

  if (vnode.children) {
    vnode.children.forEach((child: VNode | string) => {
      el.appendChild(element(child));
    });
  }

  return el;
};
