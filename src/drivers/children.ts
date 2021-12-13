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

export const getLIS = (sequence: number[], i: number) => {
  const lis: number[] = [];
  const increasingSubsequence: number[] = [];
  const lengths: number[] = new Array(sequence.length);
  let maxSubsequenceLength = -1;

  for (; i < sequence.length; ++i) {
    const number = sequence[i];
    if (number < 0) continue;
    const target = binarySearch(lis, number);
    if (target !== -1) lengths[i] = increasingSubsequence[target];
    if (target === maxSubsequenceLength) {
      maxSubsequenceLength++;
      lis[maxSubsequenceLength] = number;
      increasingSubsequence[maxSubsequenceLength] = i;
    } else if (number < lis[target + 1]) {
      lis[target + 1] = number;
      increasingSubsequence[target + 1] = i;
    }
  }
  for (
    i = increasingSubsequence[maxSubsequenceLength];
    maxSubsequenceLength >= 0;
    i = lengths[i], maxSubsequenceLength--
  ) {
    lis[maxSubsequenceLength] = i;
  }
  return lis;
};

export const binarySearch = (sequence: number[], target: number) => {
  let min = -1;
  let max = sequence.length;
  if (max > 0 && sequence[max - 1] <= target) {
    return max - 1;
  }
  while (max - min > 1) {
    const mid = (min + max) >> 1;
    if (sequence[mid] > target) {
      max = mid;
    } else {
      min = mid;
    }
  }
  console.log(min, target);
  return min;
};

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
      if (oldVNode?.children?.join('') !== newVNode.children!.join('')) {
        workStack.push(() => (el.textContent = newVNode.children!.join('')));
      }
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
        const I = {};
        const P: number[] = [];
        for (let i = newHead; i <= newTail; i++) {
          I[(<VElement>newVNodeChildren[i]).key!] = i;
          P[i] = -1;
        }
        for (let i = oldHead; i <= oldTail; i++) {
          const j = I[(<VElement>oldVNodeChildren[i]).key!];
          if (j != null) {
            P[j] = i;
          } else {
            const node = el.childNodes[i];
            workStack.push(() => el.removeChild(node));
          }
        }
        const lis = getLIS(P, newHead);
        let i = 0;

        while (newHead <= newTail) {
          const newVNodeChild = <VElement>newVNodeChildren[newHead];
          const node = el.childNodes[P[newHead]];
          const newPosition = newHead++;
          if (newHead === lis[i]) {
            workStack.push(() => el.insertBefore(node, el.childNodes[P[newPosition]]));
            i++;
          } else if (P[newHead] === -1) {
            workStack.push(() =>
              el.insertBefore(createElement(newVNodeChild, false), el.childNodes[newPosition]),
            );
          } else {
            workStack.push(() => el.insertBefore(node, el.childNodes[P[newPosition]]));
          }
        }
      }
      return data;
    }

    return data;
  };
