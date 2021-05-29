import { VNode } from './h';

export const sameVNode = (vnode1: VNode, vnode2: VNode): boolean => {
  const isSameTag = vnode1.tag === vnode2.tag;
  const isSameAttributes = JSON.stringify(vnode1.attributes) === JSON.stringify(vnode2.attributes);
  const isSameText = vnode1.text === vnode2.text;

  return isSameTag && isSameAttributes && isSameText;
};

export const isVNode = (vnode: VNode | HTMLElement): boolean => 'tag' in vnode;

export const createElement = (vnode: VNode): HTMLElement => {
  const element = document.createElement(vnode.tag);

  if (vnode.text) element.textContent = vnode.text;
  if (vnode.attributes) {
    Object.entries(vnode.attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }
  if (vnode.children) {
    vnode.children.forEach((child: VNode | string) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(createElement(child));
      }
    });
  }

  return element;
};

export const patch = (
  parent: HTMLElement,
  oldVNode: VNode,
  newVNode: VNode,
): void => {
  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
  } else if (!sameVNode(newVNode, oldVNode)) {
    parent.replaceChild(createElement(newVNode), createElement(oldVNode));
  }
};
