import { Props, VNode, VNodeChildren } from './m';
import { createElement } from './createElement';

const OLD_VNODE_FIELD = '_';

const diffProps = (el: HTMLElement, oldProps: Props = {}, newProps: Props = {}): void => {
  const oldPropKeys = Object.keys(oldProps);
  const newPropEntries = Object.entries(newProps);

  if (oldPropKeys.length > newPropEntries.length) {
    // Deletion has occured
    oldPropKeys.forEach((propName) => {
      const newPropValue = newProps[propName];
      if (newPropValue) {
        if (newPropValue !== oldProps[propName]) el[propName] = newPropValue;
        return;
      }
      delete el[propName];
    });
  } else {
    // Addition/No change/Content modification has occured
    newPropEntries.forEach(([propName, propValue]) => {
      const oldPropValue = oldProps[propName];
      if (oldPropValue) {
        if (oldPropValue !== oldProps[propName]) el[propName] = propValue;
        return;
      }
      el[propName] = propValue;
    });
  }
};

const diffChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNodeChildren | undefined,
  newVNodeChildren: VNodeChildren | undefined,
): void => {
  if (!newVNodeChildren) {
    // Fastest way to remove all children
    el.textContent = '';
    return;
  }
  if (oldVNodeChildren) {
    oldVNodeChildren.forEach((oldVChild, i) => {
      patch(newVNodeChildren[i], <HTMLElement | Text>el.childNodes[i], oldVChild);
    });
  }
  newVNodeChildren.slice(oldVNodeChildren?.length ?? 0).forEach((unresolvedVNodeChild) => {
    el.appendChild(createElement(unresolvedVNodeChild));
  });
};

export const patch = (
  newVNode: VNode | string,
  el: HTMLElement | Text,
  prevVNode?: VNode | string,
): void => {
  if (!newVNode) return el.remove();

  const oldVNode: VNode | string | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
  const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

  const replaceElement = (): void => {
    const newElement = createElement(newVNode);
    if (!hasString && !prevVNode) newElement[OLD_VNODE_FIELD] = newVNode;
    el.replaceWith(newElement);
  };

  if (hasString && oldVNode !== newVNode) return replaceElement();
  if (!hasString) {
    if (
      (<VNode>oldVNode)?.tag !== (<VNode>newVNode)?.tag ||
      (!(<VNode>newVNode).children && !(<VNode>newVNode).props)
    ) {
      // newVNode has no props/children is replaced because it is generally
      // faster to create a empty HTMLElement rather than iteratively/recursively
      // remove props/children
      return replaceElement();
    }
    if (oldVNode && !(el instanceof Text)) {
      diffProps(el, (<VNode>oldVNode).props, (<VNode>newVNode).props);
      diffChildren(el, (<VNode>oldVNode).children, (<VNode>newVNode).children);
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
};
