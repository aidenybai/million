import { createElement } from './createElement';
import { VElement, VNode, VProps } from './m';

export const OLD_VNODE_FIELD = '__m_old_vnode';

const props = ['checked', 'value', 'className', 'style', 'ns', 'key'];

const setProp = (el: HTMLElement, name: string, value: string | unknown | (() => void)): void => {
  if ((typeof value == 'function' && name.startsWith('on')) || props.includes(name)) {
    el[name] = value;
  } else {
    el.setAttribute(name, <string>value);
  }
};

const patchProps = (el: HTMLElement, oldProps: VProps = {}, newProps: VProps = {}): void => {
  const oldPropKeys = Object.keys(oldProps ?? {});
  const newPropEntries = Object.entries(newProps ?? {});

  if (oldPropKeys.length > newPropEntries.length) {
    // Deletion has occured
    oldPropKeys.forEach((propName) => {
      const newPropValue = newProps[propName];
      if (newPropValue) {
        if (newPropValue !== oldProps[propName]) setProp(el, propName, newPropValue);
        return;
      }
      delete el[propName];
    });
  } else {
    // Addition/No change/Content modification has occured
    newPropEntries.forEach(([propName, propValue]) => {
      const oldPropValue = oldProps[propName];
      if (oldPropValue) {
        if (oldPropValue !== oldProps[propName]) setProp(el, propName, propValue);
        return;
      }
      setProp(el, propName, propValue);
    });
  }
};

const patchChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNode[] | undefined,
  newVNodeChildren: VNode[] | undefined,
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
    el.appendChild(createElement(unresolvedVNodeChild, false));
  });
};

/**
 * Diffs two Virtual Nodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode} newVNode - Newest Virtual Node
 * @param {VNode=} prevVNode - Previous Virtual Node
 * @returns {HTMLElement|Text}
 */
export const patch = (
  el: HTMLElement | Text,
  newVNode: VNode,
  prevVNode?: VNode,
): HTMLElement | Text => {
  if (!newVNode) {
    el.remove();
    return el;
  }

  const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
  const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

  const replaceElement = (): HTMLElement | Text => {
    const newElement = createElement(newVNode);
    el.replaceWith(newElement);
    return newElement;
  };

  if (hasString && oldVNode !== newVNode) return replaceElement();
  if (!hasString) {
    // Check if (oldVNode|newVNode).props.key exists, then diff them
    if (
      (!(<VElement>oldVNode)?.props?.key && !(<VElement>newVNode)?.props?.key) ||
      (<VElement>oldVNode)?.props?.key !== (<VElement>newVNode)?.props?.key
    ) {
      if (
        (<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag &&
        !(<VElement>newVNode).children &&
        !(<VElement>newVNode).props
      ) {
        // newVNode has no props/children is replaced because it is generally
        // faster to create a empty HTMLElement rather than iteratively/recursively
        // remove props/children
        return replaceElement();
      }
      if (oldVNode && !(el instanceof Text)) {
        patchProps(el, (<VElement>oldVNode).props, (<VElement>newVNode).props);
        patchChildren(el, (<VElement>oldVNode).children, (<VElement>newVNode).children);
      }
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;

  return el;
};
