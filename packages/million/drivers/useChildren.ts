import { createElement } from '../createElement';
import {
  Commit,
  DeltaOperation,
  DeltaTypes,
  DOMNode,
  DOMOperation,
  Driver,
  Flags,
  NODE_OBJECT_POOL_FIELD,
  VElement,
  VNode,
} from '../types';

/**
 * Diffs two VNode children and modifies the DOM node based on the necessary changes
 */
export const useChildren =
  (drivers: Partial<Driver>[] = []): Partial<Driver> =>
  (
    el: HTMLElement | SVGElement,
    newVNode: VElement,
    oldVNode?: VElement,
    commit: Commit = (work: () => void) => work(),
    effects: DOMOperation[] = [],
    driver?: Driver,
  ): ReturnType<Driver> => {
    const getData = (element: DOMNode): ReturnType<Driver> => ({
      el: element,
      newVNode,
      oldVNode,
      effects,
      commit,
      driver,
    });

    const finish = (element: DOMNode): ReturnType<Driver> => {
      const data = getData(element);
      for (let i = 0; i < drivers.length; ++i) {
        commit!(() => {
          (<Driver>drivers[i])(el, newVNode, oldVNode, commit, effects, driver);
        }, data);
      }
      return data;
    };

    const oldVNodeChildren: VNode[] = oldVNode?.children ?? [];
    const newVNodeChildren: VNode[] | undefined = newVNode.children;
    const delta: DeltaOperation[] | undefined = newVNode.delta;
    const diff = (el: DOMNode, newVNode: VNode, oldVNode?: VNode) =>
      driver!(el, newVNode, oldVNode, commit, effects).effects!;

    // Deltas are a way for the compile-time to optimize runtime operations
    // by providing a set of predefined operations. This is useful for cases
    // where you are performing consistent, predictable operations at a high
    // interval, low payload situation.
    if (delta) {
      for (let i = 0; i < delta.length; ++i) {
        const [deltaType, deltaPosition] = delta[i];
        const child = <DOMNode>el.childNodes.item(deltaPosition);

        if (deltaType === DeltaTypes.INSERT) {
          effects.push(() =>
            el.insertBefore(createElement(newVNodeChildren![deltaPosition], false), child),
          );
        }

        if (deltaType === DeltaTypes.UPDATE) {
          commit!(() => {
            effects = diff(
              child,
              newVNodeChildren![deltaPosition],
              oldVNodeChildren[deltaPosition],
            );
          }, getData(child));
        }

        if (deltaType === DeltaTypes.DELETE) {
          effects.push(() => el.removeChild(child));
        }
      }
      return finish(el);
    }

    // Flags allow for greater optimizability by reducing condition branches.
    // Generally, you should use a compiler to generate these flags, but
    // hand-writing them is also possible
    if (!newVNodeChildren || newVNode.flag === Flags.NO_CHILDREN) {
      if (!oldVNodeChildren) return finish(el);

      effects.push(() => (el.textContent = ''));
      return finish(el);
    }

    /**
     * ∆drown - "diff or drown"
     *
     * Million's keyed children diffing is a variant of Hunt-Szymanski[1] algorithm. They
     * both are in O(ND) time to find shortest edit distance. However, instead of using a
     * longest increasing subsequence algorithm, it generates a key map and deals with
     * it linearly. Additionally, Million holds removed keyed nodes in an mapped object
     * pool, recycling DOM nodes to reduce unnecessary element creation computation.
     *
     * [1] Hunt-Szymanski algorithm:
     *  - https://neil.fraser.name/writing/diff
     *  - https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.608.1614&rep=rep1&type=pdf
     *  - https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.4.6927&rep=rep1&type=pdf
     *
     * This diffing algorithm attempts to reduce the number of DOM operations that
     * need to be performed by leveraging keys. It works in several steps:
     *
     * 1. Common end optimization
     *
     * This optimization technique is looking for nodes with identical keys by
     * simultaneously iterating through nodes in the old children list `oldVNodeChildren`
     * and new children list `newVNodeChildren` from both the suffix[2] and prefix[3].
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
     * list `newVNodeChildren`[6]. When length of `newVNodeChildren` is zero, remove
     * remaining nodes from `oldVNodeChildren`[7].
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
     * to key map `oldKeyMap`[8].
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
     * node and insert the node at the new index[9].
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
     * Iterate through `oldKeyMap` values and remove DOM nodes at those indicies[11].
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
    if (newVNode.flag === Flags.ONLY_KEYED_CHILDREN) {
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
        } else if (oldHeadVNode.key === newTailVNode.key) {
          // [4] Right move
          const node = el.childNodes.item(oldHead++);
          const tail = newTail--;
          effects.push(() => el.insertBefore(node, el.childNodes.item(tail).nextSibling));
        } else if (oldTailVNode.key === newHeadVNode.key) {
          // [5] Left move
          const node = el.childNodes.item(oldTail--);
          const head = newHead++;
          effects.push(() => el.insertBefore(node, el.childNodes.item(head)));
        } else break;
      }

      if (oldHead > oldTail) {
        // [6] Old children optimization
        while (newHead <= newTail) {
          const head = newHead++;
          effects.push(() =>
            el.insertBefore(
              el[NODE_OBJECT_POOL_FIELD][(<VElement>newVNodeChildren[head]).key!] ??
                createElement(newVNodeChildren[head], false),
              el.childNodes.item(head),
            ),
          );
        }
      } else if (newHead > newTail) {
        // [7] New children optimization
        while (oldHead <= oldTail) {
          const head = oldHead++;
          const node = el.childNodes.item(head);
          el[NODE_OBJECT_POOL_FIELD][(<VElement>oldVNodeChildren[head]).key!] = node;
          effects.push(() => el.removeChild(node));
        }
      } else {
        // [8] Indexing old children
        const oldKeyMap: Record<string, number> = {};

        for (; oldHead <= oldTail; ) {
          oldKeyMap[(<VElement>oldVNodeChildren[oldHead]).key!] = oldHead++;
        }

        while (newHead <= newTail) {
          const head = newHead++;
          const newVNodeChild = <VElement>newVNodeChildren[head];
          const oldVNodePosition = oldKeyMap[newVNodeChild.key!];

          if (oldVNodePosition !== undefined) {
            // [9] Reordering continuous nodes
            const node = el.childNodes.item(oldVNodePosition);
            effects.push(() => el.insertBefore(node, el.childNodes.item(head)));
            delete oldKeyMap[newVNodeChild.key!];
          } else {
            // [10] Create new nodes
            effects.push(() =>
              el.insertBefore(
                el[NODE_OBJECT_POOL_FIELD][newVNodeChild.key] ??
                  createElement(newVNodeChild, false),
                el.childNodes.item(head),
              ),
            );
          }
        }

        // [11] Clean up removed nodes
        for (const oldVNodeKey in oldKeyMap) {
          const node = el.childNodes.item(oldKeyMap[oldVNodeKey]);
          el[NODE_OBJECT_POOL_FIELD][oldVNodeKey] = node;
          effects.push(() => el.removeChild(node));
        }
      }

      return finish(el);
    }

    if (newVNode.flag === Flags.ONLY_TEXT_CHILDREN) {
      const oldString = Array.isArray(oldVNode?.children)
        ? oldVNode?.children.join('')
        : oldVNode?.children;
      const newString = Array.isArray(newVNode?.children)
        ? newVNode?.children.join('')
        : newVNode?.children;
      if (oldString !== newString) {
        effects.push(() => (el.textContent = newString!));
      }
      return finish(el);
    }

    if (newVNode.flag === undefined || newVNode.flag === Flags.ANY_CHILDREN) {
      if (oldVNodeChildren && newVNodeChildren) {
        const commonLength = Math.min(oldVNodeChildren.length, newVNodeChildren.length);

        // Interates backwards, so in case a childNode is destroyed, it will not shift the nodes
        // and break accessing by index
        for (let i = commonLength - 1; i >= 0; --i) {
          commit!(() => {
            effects = diff(
              <DOMNode>el.childNodes.item(i),
              newVNodeChildren[i],
              oldVNodeChildren[i],
            );
          }, getData(el));
        }

        if (newVNodeChildren.length > oldVNodeChildren.length) {
          for (let i = commonLength; i < newVNodeChildren.length; ++i) {
            const node = createElement(newVNodeChildren[i], false);
            effects.push(() => el.appendChild(node));
          }
        } else if (newVNodeChildren.length < oldVNodeChildren.length) {
          for (let i = oldVNodeChildren.length - 1; i >= commonLength; --i) {
            effects.push(() => el.removeChild(el.childNodes.item(i)));
          }
        }
      } else if (newVNodeChildren) {
        for (let i = 0; i < newVNodeChildren.length; ++i) {
          const node = createElement(newVNodeChildren[i], false);
          effects.push(() => el.appendChild(node));
        }
      }

      return finish(el);
    }

    return finish(el);
  };
