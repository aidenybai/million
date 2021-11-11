import { createElement } from '../createElement';
import {
  DOMNode,
  VDelta,
  VDeltaOperationTypes,
  VDriver,
  VElement,
  VFlags,
  VNode,
  VTask,
} from '../types/base';

/**
 * Diffs two VNode children and modifies the DOM node based on the necessary changes
 */
export const children =
  (): VDriver =>
  // @ts-expect-error Subset of VDriver
  (
    el: HTMLElement | SVGElement,
    newVNode: VElement,
    oldVNode?: VElement,
    workStack: VTask[] = [],
    driver?: VDriver,
  ): ReturnType<VDriver> => {
    const diff = (el: DOMNode, newVNode: VNode, oldVNode?: VNode) =>
      driver!(el, newVNode, oldVNode, workStack).workStack!;
    const data = {
      el,
      newVNode,
      oldVNode,
      workStack,
    };

    if (newVNode.flag === VFlags.IGNORE_NODE) return data;

    if (newVNode.flag === VFlags.REPLACE_NODE) {
      el.replaceWith(createElement(newVNode));
      return data;
    }

    const oldVNodeChildren: VNode[] = oldVNode?.children ?? [];
    const newVNodeChildren: VNode[] | undefined = newVNode.children;
    const delta: VDelta | undefined = newVNode.delta;

    // Deltas are a way for the compile-time to optimize runtime operations
    // by providing a set of predefined operations. This is useful for cases
    // where you are performing consistent, predictable operations at a high
    // interval, low payload situation.
    if (delta) {
      for (let i = 0; i < delta.length; ++i) {
        const [deltaType, deltaPosition] = delta[i];
        const child = el.childNodes[deltaPosition];
        switch (deltaType) {
          case VDeltaOperationTypes.INSERT:
            workStack.push(() =>
              el.insertBefore(createElement(newVNodeChildren![deltaPosition]), child),
            );
            break;
          case VDeltaOperationTypes.UPDATE:
            workStack = diff(
              <DOMNode>child,
              newVNodeChildren![deltaPosition],
              oldVNodeChildren[deltaPosition],
            );
            break;
          case VDeltaOperationTypes.DELETE:
            workStack.push(() => el.removeChild(child));
            break;
        }
      }
      return data;
    }

    // Flags allow for greater optimizability by reducing condition branches.
    // Generally, you should use a compiler to generate these flags, but
    // hand-writing them is also possible
    if (!newVNodeChildren || newVNode.flag === VFlags.NO_CHILDREN) {
      if (!oldVNodeChildren) return data;

      workStack.push(() => (el.textContent = ''));
      return data;
    }
    if (newVNode.flag === undefined || newVNode.flag === VFlags.ANY_CHILDREN) {
      if (oldVNodeChildren) {
        // Interates backwards, so in case a childNode is destroyed, it will not shift the nodes
        // and break accessing by index
        for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
          workStack = diff(<DOMNode>el.childNodes[i], newVNodeChildren[i], oldVNodeChildren[i]);
        }
      }

      for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length ?? 0; ++i) {
        const node = createElement(newVNodeChildren[i], false);
        workStack.push(() => el.appendChild(node));
      }
      return data;
    }
    if (newVNode.flag === VFlags.ONLY_TEXT_CHILDREN) {
      workStack.push(() => (el.textContent = newVNode.children!.join('')));
      return data;
    }
    if (newVNode.flag === VFlags.ONLY_KEYED_CHILDREN) {
      let oldHead = 0;
      let newHead = 0;
      let oldTail = oldVNodeChildren.length - 1;
      let newTail = newVNodeChildren.length - 1;

      // Constrain tails to dirty vnodes: [X, A, B, C], [Y, A, B, C] -> [X], [Y]
      while (oldHead <= oldTail && newHead <= newTail) {
        if (
          (<VElement>oldVNodeChildren[oldTail]).key !== (<VElement>newVNodeChildren[newTail]).key
        ) {
          break;
        }
        oldTail--;
        newTail--;
      }

      // Constrain heads to dirty vnodes: [A, B, C, X], [A, B, C, Y] -> [X], [Y]
      while (oldHead <= oldTail && newHead <= newTail) {
        if (
          (<VElement>oldVNodeChildren[oldHead]).key !== (<VElement>newVNodeChildren[newHead]).key
        ) {
          break;
        }
        oldHead++;
        newHead++;
      }

      if (oldHead > oldTail) {
        // There are no dirty old children: [], [X, Y, Z]
        while (newHead <= newTail) {
          const newHeadIndex = newHead++;
          workStack.push(() =>
            el.insertBefore(
              createElement(newVNodeChildren[newHeadIndex], false),
              el.childNodes[newHeadIndex],
            ),
          );
        }
      } else if (newHead > newTail) {
        // There are no dirty new children: [X, Y, Z], []
        while (oldHead <= oldTail) {
          const node = el.childNodes[oldHead++];
          workStack.push(() => el.removeChild(node));
        }
      } else {
        const oldKeyMap: Record<string, number> = {};
        for (let i = oldTail; i >= oldHead; --i) {
          oldKeyMap[(<VElement>oldVNodeChildren[i]).key!] = i;
        }
        while (newHead <= newTail) {
          const newVNodeChild = <VElement>newVNodeChildren[newHead];
          const oldVNodePosition = oldKeyMap[newVNodeChild.key!];
          const node = el.childNodes[oldVNodePosition];
          const newPosition = newHead++;

          if (
            oldVNodePosition !== undefined &&
            newVNodeChild.key === (<VElement>oldVNodeChildren[oldVNodePosition]).key
          ) {
            if (newPosition !== oldVNodePosition) {
              // Determine move for child that moved: [X, A, B, C] -> [A, B, C, X]
              workStack.push(() => el.insertBefore(node, el.childNodes[newPosition]));
            }
            delete oldKeyMap[newVNodeChild.key!];
          } else {
            // VNode doesn't exist yet: [] -> [X]
            workStack.push(() =>
              el.insertBefore(createElement(newVNodeChild, false), el.childNodes[newPosition]),
            );
          }
        }
        for (const oldVNodePosition of Object.values(oldKeyMap)) {
          // VNode wasn't found in new vnodes, so it's cleaned up: [X] -> []
          const node = el.childNodes[oldVNodePosition];
          workStack.push(() => el.removeChild(node));
        }
      }
      return data;
    }

    return data;
  };
