import { createElement } from './createElement';
import {
  OLD_VNODE_FIELD,
  VDelta,
  VDeltaOperationTypes,
  VElement,
  VFlags,
  VNode,
  VProps,
} from './structs';

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 * @param {HTMLElement} el - Target element to be modified
 * @param {VProps} oldProps - Old VNode props
 * @param {VProps} newProps - New VNode props
 * @returns {void}
 */
export const patchProps = (el: HTMLElement, oldProps: VProps, newProps: VProps): void => {
  const skip = new Set<string>();
  for (const oldPropName of Object.keys(oldProps)) {
    const newPropValue = newProps[oldPropName];
    if (newPropValue) {
      const oldPropValue = oldProps[oldPropName];
      if (newPropValue !== oldPropValue) {
        if (typeof oldPropValue === 'function' && typeof newPropValue === 'function') {
          if (oldPropValue.toString() !== newPropValue.toString()) {
            el[oldPropName] = newPropValue;
          }
        } else {
          el[oldPropName] = newPropValue;
        }
      }
      skip.add(oldPropName);
    } else {
      el.removeAttribute(oldPropName);
      delete el[oldPropName];
    }
  }

  for (const newPropName of Object.keys(newProps)) {
    if (!skip.has(newPropName)) {
      el[newPropName] = newProps[newPropName];
    }
  }
};

/**
 * Diffs two VNode children and modifies the DOM node based on the necessary changes
 * @param {HTMLElement} el - Target element to be modified
 * @param {VNode[]} oldVNodeChildren - Old VNode children
 * @param {VNode[]} newVNodeChildren - New VNode children
 * @returns {void}
 */
export const patchChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNode[],
  newVNodeChildren: VNode[],
  keyed: boolean,
  delta?: VDelta,
): void => {
  if (!newVNodeChildren) {
    el.textContent = '';
  } else if (delta) {
    for (let i = 0; i < delta.length; i++) {
      const [deltaType, deltaPosition] = delta[i];
      switch (deltaType) {
        case VDeltaOperationTypes.INSERT:
          el.insertBefore(
            createElement(newVNodeChildren[deltaPosition]),
            el.childNodes[deltaPosition],
          );
          break;
        case VDeltaOperationTypes.UPDATE:
          patch(
            <HTMLElement | Text>el.childNodes[deltaPosition],
            newVNodeChildren[deltaPosition],
            oldVNodeChildren[deltaPosition],
          );
          break;
        case VDeltaOperationTypes.DELETE:
          el.removeChild(el.childNodes[deltaPosition]);
          break;
      }
    }
  } else if (keyed) {
    // Diffing algorithm adapted from Fre
    let oldHead = 0;
    let newHead = 0;
    let oldTail = oldVNodeChildren.length - 1;
    let newTail = newVNodeChildren.length - 1;

    // Constrain tails to dirty vnodes: [X, A, B, C], [Y, A, B, C] -> [X], [Y]
    while (oldHead <= oldTail && newHead <= newTail) {
      if ((<VElement>oldVNodeChildren[oldTail]).key !== (<VElement>newVNodeChildren[newTail]).key)
        break;
      oldTail--;
      newTail--;
    }

    // Constrain heads to dirty vnodes: [A, B, C, X], [A, B, C, Y] -> [X], [Y]
    while (oldHead <= oldTail && newHead <= newTail) {
      if ((<VElement>oldVNodeChildren[oldTail]).key !== (<VElement>newVNodeChildren[newTail]).key)
        break;
      oldHead++;
      newHead++;
    }

    if (oldHead > oldTail) {
      // There are no dirty old children: [], [X, Y, Z]
      while (newHead <= newTail) {
        el.insertBefore(createElement(newVNodeChildren[newTail], false), el.childNodes[newTail--]);
      }
    } else if (newHead > newTail) {
      // There are no dirty new children: [X, Y, Z], []
      while (oldHead <= oldTail) {
        el.removeChild(el.childNodes[oldTail--]);
      }
    } else {
      const keyMap = {};
      for (let i = oldHead; i <= oldTail; i++) {
        keyMap[(<VElement>oldVNodeChildren[i]).key!] = i;
      }
      while (newHead <= newTail) {
        const newVNodeChild = <VElement>newVNodeChildren[newTail];
        const i = keyMap[newVNodeChild.key!];
        if (i && newVNodeChild.key === (<VElement>oldVNodeChildren[i]).key) {
          // Determine move for child that moved: [X, A, B, C] -> [A, B, C, X]
          const child = el.removeChild(el.childNodes[i]);
          el.insertBefore(child, el.childNodes[newTail--]);
          delete keyMap[newVNodeChild.key!];
        } else {
          // VNode doesn't exist yet: [] -> [X]
          el.insertBefore(createElement(newVNodeChild, false), el.childNodes[newTail--]);
        }
      }

      for (const key in keyMap) {
        // VNode wasn't found in new vnodes, so it's cleaned up: [X] -> []
        el.removeChild(el.childNodes[keyMap[key]]);
      }
    }

    // Patch and update the new children top up: [X, Y, Z], [Y, X, Z] -> [Y, X, Z]
    while (newHead-- > 0) {
      patch(el, newVNodeChildren[newHead], oldVNodeChildren[newHead]);
    }
  } else {
    if (oldVNodeChildren) {
      // Interates backwards, so in case a childNode is destroyed, it will not shift the nodes
      // and break accessing by index
      for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
        patch(<HTMLElement | Text>el.childNodes[i], newVNodeChildren[i], oldVNodeChildren[i]);
      }
    }
    for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length; ++i) {
      el.appendChild(createElement(newVNodeChildren[i], false));
    }
  }
};

const replaceElementWithVNode = (el: HTMLElement | Text, newVNode: VNode): void => {
  el.replaceWith(createElement(newVNode));
};

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode} newVNode - New VNode
 * @param {VNode=} prevVNode - Previous VNode
 * @returns {void}
 */
export const patch = (el: HTMLElement | Text, newVNode: VNode, prevVNode?: VNode): void => {
  if (!newVNode) {
    el.remove();
  } else {
    const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
    const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

    if (hasString && oldVNode !== newVNode) {
      replaceElementWithVNode(el, newVNode);
    } else if (!hasString) {
      if (
        (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
        (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
      ) {
        if ((<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag || el instanceof Text) {
          replaceElementWithVNode(el, newVNode);
        } else {
          patchProps(el, (<VElement>oldVNode)?.props || {}, (<VElement>newVNode).props || {});

          // Flags allow for greater optimizability by reducing condition branches.
          // Generally, you should use a compiler to generate these flags, but
          // hand-writing them is also possible
          switch (<VFlags>(<VElement>newVNode).flag) {
            case VFlags.NO_CHILDREN:
              el.textContent = '';
              break;
            case VFlags.ONLY_TEXT_CHILDREN:
              // Joining is faster than setting textContent to an array
              el.textContent = <string>(<VElement>newVNode).children!.join('');
              break;
            default:
              patchChildren(
                el,
                (<VElement>oldVNode)?.children || [],
                (<VElement>newVNode).children!,
                <VFlags>(<VElement>newVNode).flag === VFlags.ONLY_KEYED_CHILDREN,
                // We need to pass delta here because this function does not have
                // a reference to the actual vnode.
                (<VElement>newVNode).delta,
              );
              break;
          }
        }
      }
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
};
