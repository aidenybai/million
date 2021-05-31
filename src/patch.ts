import { Props, VNode, VNodeChildren } from './h';
import { element } from './element';

const OLD_VNODE_FLAG = '__old_v_node';

const diffProps = (el: HTMLElement, oldProps: Props = {}, newProps: Props = {}): void => {
  Object.keys(oldProps).forEach((propName) => {
    const newPropValue = newProps[propName];
    if (newPropValue) {
      if (newPropValue !== oldProps[propName]) el[propName] = newPropValue;
      return;
    }
    el[propName] = undefined;
  });
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
  if (!newVNode) return el.remove();

  const oldVNode: VNode | string | undefined = prevVNode ?? el[OLD_VNODE_FLAG];

  if (oldVNode !== newVNode || (oldVNode as VNode)?.tag !== (newVNode as VNode)?.tag) {
    const newElement = element(newVNode);
    el.replaceWith(newElement);
    return;
  }

  if (typeof oldVNode !== 'string' && typeof newVNode !== 'string' && oldVNode && newVNode) {
    if (oldVNode.mutable) diffProps(el, oldVNode.props, newVNode.props);
    diffChildren(el, oldVNode.children, newVNode.children);
  }

  el[OLD_VNODE_FLAG] = newVNode;
};
