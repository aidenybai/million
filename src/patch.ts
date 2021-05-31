import { Props, VNode, VNodeChildren } from './h';
import { element } from './element';

const OLD_VNODE_FLAG = '__old_v_node';

const diffProps = (el: HTMLElement, oldProps: Props = {}, newProps: Props = {}): void => {
  const oldPropKeys = Object.keys(oldProps);
  const newPropEntries = Object.entries(newProps);

  if (oldPropKeys.length > newPropEntries.length) {
    // Iterate over keys if deletion has occured
    oldPropKeys.forEach((propName) => {
      const newPropValue = newProps[propName];
      // If it hasn't been deleted
      if (newPropValue) {
        // If the value is changed
        if (newPropValue !== oldProps[propName]) el[propName] = newPropValue;
        return;
      }
      delete el[propName];
    });
  } else {
    // Iterate over keys if addition has occured
    newPropEntries.forEach(([propName, propValue]) => {
      const oldPropValue = oldProps[propName];
      // If it hasn't been added
      if (oldPropValue) {
        // If the value is changed
        if (oldPropValue !== oldProps[propName]) el[propName] = propValue;
        return;
      }
      el[propName] = propValue;
    });
  }
};

const diffChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNodeChildren = [],
  newVNodeChildren: VNodeChildren = [],
): void => {
  oldVNodeChildren.forEach((oldVChild, i) => {
    patch(newVNodeChildren[i], el.childNodes[i] as HTMLElement | Text, oldVChild);
  });

  newVNodeChildren.slice(oldVNodeChildren.length).forEach((unresolvedVNodeChild) => {
    el.appendChild(element(unresolvedVNodeChild));
  });
};

export const patch = (
  newVNode: VNode | string | undefined,
  el: HTMLElement | Text,
  prevVNode?: VNode | string | undefined,
): void => {
  if (!newVNode) return el.remove();

  const oldVNode: VNode | string | undefined = prevVNode ?? el[OLD_VNODE_FLAG];

  if (oldVNode !== newVNode || (oldVNode as VNode)?.tag !== (newVNode as VNode)?.tag) {
    const newElement = element(newVNode);
    el.replaceWith(newElement);
  } else if (
    typeof oldVNode !== 'string' &&
    typeof newVNode !== 'string' &&
    oldVNode &&
    newVNode &&
    !(el instanceof Text)
  ) {
    if (oldVNode.mutable) diffProps(el, oldVNode.props, newVNode.props);
    diffChildren(el, oldVNode.children, newVNode.children);
  }

  el[OLD_VNODE_FLAG] = newVNode;
};
