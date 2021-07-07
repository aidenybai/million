import { OLD_VNODE_FIELD } from './constants';
import { createElement } from './createElement';
import { VElement, VFlags, VNode, VProps } from './structs';

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 * @param {HTMLElement} el - Target element to be modified
 * @param {VProps} oldProps - Old VNode props
 * @param {VProps} newProps - New VNode props
 */
/* istanbul ignore next */
export const patchProps = (el: HTMLElement, oldProps: VProps, newProps: VProps): void => {
  const cache = new Set<string>();
  for (const oldPropName of Object.keys(oldProps)) {
    const newPropValue = newProps[oldPropName];
    if (newPropValue) {
      el[oldPropName] = newPropValue;
      cache.add(oldPropName);
    } else {
      el.removeAttribute(oldPropName);
      delete el[oldPropName];
    }
  }

  for (const newPropName of Object.keys(newProps)) {
    if (!cache.has(newPropName)) {
      el[newPropName] = newProps[newPropName];
    }
  }
};

/**
 * Diffs two VNode children and modifies the DOM node based on the necessary changes
 * @param {HTMLElement} el - Target element to be modified
 * @param {VNode[]} oldVNodeChildren - Old VNode children
 * @param {VNode[]} newVNodeChildren - New VNode children
 */
export const patchChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNode[],
  newVNodeChildren: VNode[],
): void => {
  /* istanbul ignore next */
  if (oldVNodeChildren) {
    for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
      patch(<HTMLElement | Text>el.childNodes[i], newVNodeChildren[i], oldVNodeChildren[i]);
    }
  }
  /* istanbul ignore next */
  const slicedNewVNodeChildren = newVNodeChildren.slice(oldVNodeChildren?.length ?? 0);
  for (let i = 0; i < slicedNewVNodeChildren.length; ++i) {
    el.appendChild(createElement(slicedNewVNodeChildren[i], false));
  }
};

const replaceElementWithVNode = (el: HTMLElement | Text, newVNode: VNode): HTMLElement | Text => {
  if (typeof newVNode === 'string') {
    el.textContent = newVNode;
    return el;
  } else {
    const newElement = createElement(newVNode);
    el.replaceWith(newElement);
    return newElement;
  }
};

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode} newVNode - New VNode
 * @param {VNode=} prevVNode - Previous VNode
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

  if (hasString && oldVNode !== newVNode) return replaceElementWithVNode(el, newVNode);
  if (!hasString) {
    if (
      /* istanbul ignore next */
      (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
      (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
    ) {
      if (
        (<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag &&
        !(<VElement>newVNode).children &&
        !(<VElement>newVNode).props
      ) {
        // newVNode has no props/children is replaced because it is generally
        // faster to create a empty HTMLElement rather than iteratively/recursively
        // remove props/children
        return replaceElementWithVNode(el, newVNode);
      }
      if (oldVNode && !(el instanceof Text)) {
        patchProps(el, (<VElement>oldVNode).props || {}, (<VElement>newVNode).props || {});

        /* istanbul ignore next */
        switch (<VFlags>(<VElement>newVNode).flag) {
          case VFlags.NO_CHILDREN: {
            el.textContent = '';
            break;
          }
          case VFlags.ONLY_TEXT_CHILDREN: {
            el.textContent = <string>(<VElement>newVNode).children!.join('');
            break;
          }
          default: {
            patchChildren(el, (<VElement>oldVNode).children || [], (<VElement>newVNode).children!);
            break;
          }
        }
      }
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;

  return el;
};
