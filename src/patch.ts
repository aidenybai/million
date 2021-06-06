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
      patch(<HTMLElement | Text>el.childNodes[i], newVNodeChildren[i], oldVChild);
    });
  }
  newVNodeChildren.slice(oldVNodeChildren?.length ?? 0).forEach((unresolvedVNodeChild) => {
    el.appendChild(createElement(unresolvedVNodeChild));
  });
};

/**
 * Diffs two Virtual Nodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode|string} newVNode - Newest Virtual Node
 * @param {VNode|string} [prevVNode] - Previous Virtual Node
 * @returns {HTMLElement|Text}
 */
export const patch = (
  el: HTMLElement | Text,
  newVNode: VNode | string,
  prevVNode?: VNode | string,
): HTMLElement | Text => {
  if (!newVNode) {
    el.remove();
    return el;
  }

  const oldVNode: VNode | string | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
  const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

  const replaceElement = (): HTMLElement | Text => {
    const newElement = createElement(newVNode);
    if (!hasString && !prevVNode) newElement[OLD_VNODE_FIELD] = newVNode;
    el.replaceWith(newElement);
    return newElement;
  };

  if (hasString && oldVNode !== newVNode) return replaceElement();
  if (!hasString) {
    if (
      !(<VNode>oldVNode)?.skip &&
      ((<VNode>oldVNode)?.tag !== (<VNode>newVNode)?.tag ||
        (!(<VNode>newVNode).children && !(<VNode>newVNode).props))
    ) {
      // newVNode has no props/children is replaced because it is generally
      // faster to create a empty HTMLElement rather than iteratively/recursively
      // remove props/children
      return replaceElement();
    }
    if (oldVNode && !(el instanceof Text)) {
      if (!(<VNode>oldVNode)?.skip) {
        diffProps(el, (<VNode>oldVNode).props, (<VNode>newVNode).props);
      }
      if ((<VNode>newVNode)?.skipChildren) {
        diffChildren(el, (<VNode>oldVNode).children, (<VNode>newVNode).children);
      }
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
  return el;
};
