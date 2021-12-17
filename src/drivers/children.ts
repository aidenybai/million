import { createElement } from '../createElement';
import {
  DOMNode,
  NODE_OBJECT_POOL_FIELD,
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
              el.insertBefore(createElement(newVNodeChildren![deltaPosition], false), child),
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
      const oldString = Array.isArray(oldVNode?.children)
        ? oldVNode?.children.join('')
        : oldVNode?.children;
      const newString = Array.isArray(newVNode?.children)
        ? newVNode?.children.join('')
        : newVNode?.children;
      if (oldString !== newString) {
        workStack.push(() => (el.textContent = newString!));
      }
      return data;
    }

    /**
     * Lightweight keyed children diffing algorithm -> "diff or drown"
     *
     * Million's keyed children diffing is similar to ivi's[1] design in the fact that
     * they both are of linear time complexity. However, instead of using a longest
     * increasing subsequence algorithm, it generates a key map and deals with it
     * linearly. Additionally, Million holds removed keyed nodes in an mapped object
     * pool, recycling DOM nodes to reduce unnecessary element creation computational.
     *
     * [1] https://github.com/localvoid/ivi/blob/master/packages/ivi/src/vdom/reconciler.ts
     *
     * This allows for significantly smaller bundle size and better computational
     * performance <10,000 nodes. It becomes less efficient when common prefix/suffix
     * or zero length optimizations can't be applied and there are islands of common
     * nodes, as unnecessary insertion DOM operations are performed.
     *
     * For example, the following end to start movement will produce 5 DOM operations,
     * regardless of L->R or R->L traversal, while other Virtual DOM libraries like ivi
     * and Inferno produce 5 DOM operations L->R and 4 DOM operations R->L.
     *
     *  oldVNodeChildren: -> [a b c d X] <-
     *                                ^
     *  newVNodeChildren: -> [X a b c d] <-
     *                        ^
     *
     * Despite this, Million's code is lot cleaner and easier to read, so it's much
     * more maintainable at the sacrifice of marginal performance losses.
     *
     * This diffing algorithm attempts to reduce the number of DOM operations that
     * need to be performed by leveraging keys. It works in several steps:
     *
     * 1. Common end optimization
     *
     * This optimization technique is looking for nodes with identical keys by
     * simultaneously iterating through nodes in the old children list `oldVNodeChildren`
     * and new children list `newVNodeChildren` from both the suffix [2] and prefix [3].
     *
     *  oldVNodeChildren: -> [a b c d] <-
     *  newVNodeChildren: -> [a b d] <-
     *
     * Skip nodes "a" and "b" at the start, and node "d" at the end.
     *
     *  oldVNodeChildren: -> [c] <-
     *  newVNodeChildren: -> [] <-
     *
     * 2. Right/left move optimization
     *
     * This optimization technique allows for nodes to be shifted right[4] or left[5] without
     * the generation of a key map. This technique works for both R->L and L->R traversals,
     * and can significantly reduce the number of DOM operations necesssary without the LIS
     * technique.
     *
     *  oldVNodeChildren: [a b c X]
     *                           ^
     *  newVNodeChildren: [X a b c]
     *                     ^
     *
     * 3. Zero length optimization
     *
     * Check if the size of one of the list is equal to zero. When length of the old
     * children list `oldVNodeChildren` is zero, insert remaining nodes from the new
     * list `newVNodeChildren` [6]. When length of `newVNodeChildren` is zero, remove
     * remaining nodes from `oldVNodeChildren` [7].
     *
     *  oldVNodeChildren: -> [a b c d] <-
     *  newVNodeChildren: -> [a d] <-
     *
     * Skip nodes "a" and "d" (prefix and suffix optimization).
     *
     *  oldVNodeChildren: [b c]
     *  newVNodeChildren: []
     *
     * Remove nodes "b" and "c".
     *
     * 4. Index and reorder continuous DOM nodes optimization
     *
     * Assign original positions of the nodes from the old children list `oldVNodeChildren`
     * to key map `oldKeyMap` [8].
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *  oldKeyMap: {
     *    b: 0, // newVNodeChildren[0] == b
     *    c: 1, // newVNodeChildren[1] == c
     *    d: 2,
     *    e: 3,
     *    f: 4,
     *  }
     *
     * Iterate through `newVNodeChildren` (bounded by common end optimizations) and
     * check if the new child key is in the `oldKeyMap`. If it is, then fetch the old
     * node and insert the node at the new index [9].
     *
     * "c" is in the `oldKeyMap`, so fetch the old node at index `oldKeyMap[c] == 1`
     * and insert it in the DOM at index 0, or the new child index.
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *                     ^
     *  oldKeyMap: {
     *    b: 0,
     *    c: 1, // <- delete
     *    d: 2,
     *    e: 3,
     *    f: 4,
     *  }
     *
     * "b" is in the oldKeyMap, so fetch the old node at index `oldKeyMap[b] == 0`
     * and insert it in the DOM at index 1, or the new child index.
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *                       ^
     *  oldKeyMap: {
     *    b: 0, // <- delete
     *    d: 2,
     *    e: 3,
     *    f: 4,
     *  }
     *
     * "h" is not in the oldKeyMap, create a new node and insert it in the
     * DOM at index 2, or the new child index [10].
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *                         ^
     *  oldKeyMap: {
     *    d: 2,
     *    e: 3,
     *    f: 4,
     *  }
     *
     * "f" is in the oldKeyMap, so fetch the old node at index `oldKeyMap[f] == 4`
     * and insert it in the DOM at index 3, or the new child index.
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *                           ^
     *  oldKeyMap: {
     *    d: 2,
     *    e: 3,
     *    f: 4, // <- delete
     *  }
     *
     * "e" is in the oldKeyMap, so fetch the old node at index `oldKeyMap[e] == 3`
     * and insert it in the DOM at index 4, or the new child index.
     *
     *  oldVNodeChildren: [b c d e f]
     *  newVNodeChildren: [c b h f e]
     *                             ^
     *  oldKeyMap: {
     *    d: 2,
     *    e: 3, // <- delete
     *  }
     *
     * 5. Index and delete removed nodes.
     *
     * Iterate through `oldKeyMap` values and remove DOM nodes at those indicies [11].
     *
     * "d" is remaining in `oldKeyMap`, so remove old DOM node at index.
     *
     *  oldVNodeChildren: [b c d e f]
     *                         ^
     *  newVNodeChildren: [c b h f e]
     *  oldKeyMap: {
     *    d: 2, // <- check
     *  }
     */
    if (newVNode.flag === VFlags.ONLY_KEYED_CHILDREN) {
      if (!el[NODE_OBJECT_POOL_FIELD]) el[NODE_OBJECT_POOL_FIELD] = {};

      let oldHead = 0;
      let newHead = 0;
      let oldTail = oldVNodeChildren.length - 1;
      let newTail = newVNodeChildren.length - 1;

      while (oldHead <= oldTail && newHead <= newTail) {
        const oldTailVNode = <VElement>oldVNodeChildren[oldTail];
        const newTailVNode = <VElement>newVNodeChildren[newTail];
        const oldHeadVNode = <VElement>oldVNodeChildren[oldHead];
        const newHeadVNode = <VElement>newVNodeChildren[newHead];

        if (oldTailVNode.key === newTailVNode.key) {
          // [2] Suffix optimization
          oldTail--;
          newTail--;
        } else if (oldHeadVNode.key === newHeadVNode.key) {
          // [3] Prefix optimization
          oldHead++;
          newHead++;
        } else if (oldTailVNode.key === newHeadVNode.key) {
          // [4] Right move
          const node = el.childNodes[oldTail--];
          const head = newHead++;
          workStack.push(() => el.insertBefore(node, el.childNodes[head]));
        } else if (oldHeadVNode.key === newTailVNode.key) {
          // [5] Left move
          const node = el.childNodes[oldHead++];
          const tail = newTail--;
          workStack.push(() => el.insertBefore(node, el.childNodes[tail].nextSibling));
        } else break;
      }

      if (oldHead > oldTail) {
        // [6] Old children optimization
        while (newHead <= newTail) {
          const head = newHead++;
          workStack.push(() =>
            el.insertBefore(
              el[NODE_OBJECT_POOL_FIELD][(<VElement>newVNodeChildren[head]).key!] ??
                createElement(newVNodeChildren[head], false),
              el.childNodes[head],
            ),
          );
        }
      } else if (newHead > newTail) {
        // [7] New children optimization
        while (oldHead <= oldTail) {
          const head = oldHead++;
          const node = el.childNodes[head];
          el[NODE_OBJECT_POOL_FIELD][(<VElement>oldVNodeChildren[head]).key!] = node;
          workStack.push(() => el.removeChild(node));
        }
      } else {
        //  [8] Indexing old children
        const oldKeyMap: Record<string, number> = {};
        for (let i = oldTail; i >= oldHead; --i) {
          oldKeyMap[(<VElement>oldVNodeChildren[i]).key!] = i;
        }

        while (newHead <= newTail) {
          const head = newHead++;
          const newVNodeChild = <VElement>newVNodeChildren[head];
          const oldVNodePosition = oldKeyMap[newVNodeChild.key!];
          const node = el.childNodes[oldVNodePosition];

          if (
            oldVNodePosition !== undefined &&
            newVNodeChild.key === (<VElement>oldVNodeChildren[oldVNodePosition]).key
          ) {
            // [9] Reordering continuous nodes
            workStack.push(() => el.insertBefore(node, el.childNodes[head]));
            delete oldKeyMap[newVNodeChild.key!];
          } else {
            // [10] Create new nodes
            workStack.push(() =>
              el.insertBefore(
                el[NODE_OBJECT_POOL_FIELD][newVNodeChild.key] ??
                  createElement(newVNodeChild, false),
                el.childNodes[head],
              ),
            );
          }
        }

        // [11] Clean up removed nodes
        for (const oldVNodeKey in oldKeyMap) {
          const node = el.childNodes[oldKeyMap[oldVNodeKey]];
          el[NODE_OBJECT_POOL_FIELD][oldVNodeKey] = node;
          workStack.push(() => el.removeChild(node));
        }
      }

      return data;
    }

    return data;
  };
