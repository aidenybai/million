import { Attributes, VNode, VNodeChildren } from './h';
import { element } from './element';

const OLD_VNODE_FLAG = '__old_v_node';

const diffAttributes = (
  el: HTMLElement,
  oldAttributes: Attributes = {},
  newAttributes: Attributes = {},
): void => {
  const oldAttributesKeys = Object.keys(oldAttributes);
  const newAttributesEntries = Object.entries(newAttributes);
  if (oldAttributesKeys.length > newAttributesEntries.length) {
    oldAttributesKeys.forEach((key) => {
      const attribute = newAttributes[key];
      if (attribute) el.setAttribute(key, attribute);
      else el.removeAttribute(key);
    });
  } else {
    newAttributesEntries.forEach(([key, value]) => {
      if (oldAttributes[key] !== value) {
        el.setAttribute(key, value);
      }
    });
  }
};

const diffChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNodeChildren = [],
  newVNodeChildren: VNodeChildren = [],
): void => {
  oldVNodeChildren.forEach((oldVChild, i) => {
    patch(newVNodeChildren[i], el.children[i] as HTMLElement, oldVChild);
  });
  newVNodeChildren.slice(oldVNodeChildren.length).forEach((unresolvedVNodeChild) => {
    el.appendChild(element(unresolvedVNodeChild));
  });
};

export const patch = (
  newVNode: VNode | string | undefined,
  el: HTMLElement,
  prevVNode: VNode | string | undefined,
): void => {
  if (newVNode === undefined) return el.remove();

  const oldVNode: VNode | string | undefined = prevVNode ?? el[OLD_VNODE_FLAG];
  el[OLD_VNODE_FLAG] = newVNode;

  if (oldVNode !== newVNode || (oldVNode as VNode)?.tag !== (newVNode as VNode)?.tag) {
    const newElement = element(newVNode);
    el.replaceWith(newElement);
    return;
  }

  if (typeof oldVNode !== 'string' && typeof newVNode !== 'string' && oldVNode && newVNode) {
    diffAttributes(el, oldVNode.attributes, newVNode.attributes);
    diffChildren(el, oldVNode.children, newVNode.children);
  }
};
