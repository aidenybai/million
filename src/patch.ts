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
export const patchProps = (
  el: HTMLElement,
  oldProps: VProps,
  newProps: VProps,
  workQueue: (() => void)[],
): void => {
  const skip = new Set<string>();

  for (const oldPropName of Object.keys(oldProps)) {
    const newPropValue = newProps[oldPropName];
    if (newPropValue) {
      const oldPropValue = oldProps[oldPropName];
      if (newPropValue !== oldPropValue) {
        if (typeof oldPropValue === 'function' && typeof newPropValue === 'function') {
          if (oldPropValue.toString() !== newPropValue.toString()) {
            workQueue.push(() => (el[oldPropName] = newPropValue));
          }
        } else {
          workQueue.push(() => (el[oldPropName] = newPropValue));
        }
      }
      skip.add(oldPropName);
    } else {
      workQueue.push(() => {
        el.removeAttribute(oldPropName);
        delete el[oldPropName];
      });
    }
  }

  for (const newPropName of Object.keys(newProps)) {
    if (!skip.has(newPropName)) {
      workQueue.push(() => (el[newPropName] = newProps[newPropName]));
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
  delta: VDelta | undefined,
  workQueue: (() => void)[],
): void => {
  if (!newVNodeChildren) {
    workQueue.push(() => (el.textContent = ''));
  } else if (delta) {
    for (let i = 0; i < delta.length; i++) {
      const [deltaType, deltaPosition] = delta[i];
      switch (deltaType) {
        case VDeltaOperationTypes.INSERT:
          workQueue.push(() =>
            el.insertBefore(
              createElement(newVNodeChildren[deltaPosition]),
              el.childNodes[deltaPosition],
            ),
          );
          break;
        case VDeltaOperationTypes.UPDATE:
          patch(
            <HTMLElement | Text>el.childNodes[deltaPosition],
            newVNodeChildren[deltaPosition],
            oldVNodeChildren[deltaPosition],
            workQueue,
          );
          break;
        case VDeltaOperationTypes.DELETE:
          workQueue.push(() => el.removeChild(el.childNodes[deltaPosition]));
          break;
      }
    }
  } else if (keyed && oldVNodeChildren.length > 0) {
    // Keyed reconciliation algorithm originally adapted from [Fre](https://github.com/yisar/fre)
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
      if ((<VElement>oldVNodeChildren[oldHead]).key !== (<VElement>newVNodeChildren[newHead]).key)
        break;
      oldHead++;
      newHead++;
    }

    if (oldHead > oldTail) {
      // There are no dirty old children: [], [X, Y, Z]
      while (newHead <= newTail) {
        const newHeadIndex = Number(newHead++);
        const node = el.childNodes[newHeadIndex];
        workQueue.push(() =>
          el.insertBefore(createElement(newVNodeChildren[newHeadIndex], false), node),
        );
      }
    } else if (newHead > newTail) {
      // There are no dirty new children: [X, Y, Z], []
      while (oldHead <= oldTail) {
        const node = el.childNodes[oldTail--];
        workQueue.push(() => el.removeChild(node));
      }
    } else {
      const keyMap: Record<string, number> = {};
      for (let i = oldHead; i <= oldTail; i++) {
        keyMap[(<VElement>oldVNodeChildren[i]).key!] = i;
      }
      while (newHead <= newTail) {
        const newVNodeChild = <VElement>newVNodeChildren[newHead];
        const oldVNodePosition = keyMap[newVNodeChild.key!];
        const node = el.childNodes[oldVNodePosition];

        if (
          oldVNodePosition !== undefined &&
          newVNodeChild.key === (<VElement>oldVNodeChildren[oldVNodePosition]).key
        ) {
          // Determine move for child that moved: [X, A, B, C] -> [A, B, C, X]
          const refNode = el.childNodes[newHead++];
          workQueue.push(() => {
            el.removeChild(node);
            el.insertBefore(node, refNode);
          });
          delete keyMap[newVNodeChild.key!];
        } else {
          // VNode doesn't exist yet: [] -> [X]
          const node = el.childNodes[newHead++];
          workQueue.push(() => el.insertBefore(createElement(newVNodeChild, false), node));
        }
      }

      for (const oldVNodePosition of Object.values(keyMap)) {
        // VNode wasn't found in new vnodes, so it's cleaned up: [X] -> []
        const node = el.childNodes[oldVNodePosition];
        workQueue.push(() => el.removeChild(node));
      }
    }

    // Patch and update the new children top up: [X, Y, Z], [Y, X, Z] -> [Y, X, Z]
    while (newTail++ < newVNodeChildren.length - 1) {
      patch(
        <HTMLElement>el.childNodes[newTail],
        newVNodeChildren[newTail],
        oldVNodeChildren[newTail],
        workQueue,
      );
    }
  } else {
    if (oldVNodeChildren) {
      // Interates backwards, so in case a childNode is destroyed, it will not shift the nodes
      // and break accessing by index
      for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
        patch(
          <HTMLElement | Text>el.childNodes[i],
          newVNodeChildren[i],
          oldVNodeChildren[i],
          workQueue,
        );
      }
    }
    for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length; ++i) {
      const node = createElement(newVNodeChildren[i], false);
      workQueue.push(() => el.appendChild(node));
    }
  }
};

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode} newVNode - New VNode
 * @param {VNode=} prevVNode - Previous VNode
 * @returns {void}
 */
export const patch = (
  el: HTMLElement | Text,
  newVNode: VNode,
  prevVNode?: VNode,
  workQueue: (() => void)[] = [],
): void => {
  if (!newVNode) {
    workQueue.push(() => el.remove());
  } else {
    const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
    const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

    if (hasString && oldVNode !== newVNode) {
      workQueue.push(() => el.replaceWith(createElement(newVNode)));
    } else if (!hasString) {
      if (
        (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
        (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
      ) {
        if ((<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag || el instanceof Text) {
          workQueue.push(() => el.replaceWith(createElement(newVNode)));
        } else {
          patchProps(
            el,
            (<VElement>oldVNode)?.props || {},
            (<VElement>newVNode).props || {},
            workQueue,
          );

          // Flags allow for greater optimizability by reducing condition branches.
          // Generally, you should use a compiler to generate these flags, but
          // hand-writing them is also possible
          switch (<VFlags>(<VElement>newVNode).flag) {
            case VFlags.NO_CHILDREN:
              workQueue.push(() => (el.textContent = ''));
              break;
            case VFlags.ONLY_TEXT_CHILDREN:
              // Joining is faster than setting textContent to an array
              workQueue.push(
                () => (el.textContent = <string>(<VElement>newVNode).children!.join('')),
              );
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
                workQueue,
              );
              break;
          }
        }
      }
    }
  }

  for (let i = 0; i < workQueue.length; i++) {
    workQueue[i]();
    // eslint-disable-next-line no-debugger
    // debugger;
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
};
