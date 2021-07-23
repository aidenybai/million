import { createElement } from './createElement';
import { processWorkQueue } from './fiber';
import {
  OLD_VNODE_FIELD,
  VDelta,
  VDeltaOperationTypes,
  VElement,
  VFiber,
  VFlags,
  VNode,
  VProps,
} from './structs';

const workQueue: VFiber[] = [];

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 * @param {HTMLElement} el - Target element to be modified
 * @param {VProps} oldProps - Old VNode props
 * @param {VProps} newProps - New VNode props
 * @returns {void}
 */
export const patchProps = (el: HTMLElement, oldProps: VProps, newProps: VProps): void => {
  const cache = new Set<string>();
  for (const oldPropName of Object.keys(oldProps)) {
    const newPropValue = newProps[oldPropName];
    if (newPropValue) {
      workQueue.unshift(() => {
        el[oldPropName] = newPropValue;
      });
      cache.add(oldPropName);
    } else {
      workQueue.unshift(() => {
        el.removeAttribute(oldPropName);
      });
      delete el[oldPropName];
    }
  }

  for (const newPropName of Object.keys(newProps)) {
    if (!cache.has(newPropName)) {
      workQueue.unshift(() => {
        el[newPropName] = newProps[newPropName];
      });
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
  delta?: VDelta,
): void => {
  if (delta) {
    for (let i = 0; i < delta.length; i++) {
      const [deltaType, deltaPosition] = delta[i];
      switch (deltaType) {
        case VDeltaOperationTypes.INSERT: {
          workQueue.unshift(() => {
            el.insertBefore(
              createElement(newVNodeChildren[deltaPosition]),
              el.childNodes[deltaPosition],
            );
          });
          break;
        }
        case VDeltaOperationTypes.UPDATE: {
          patch(
            <HTMLElement | Text>el.childNodes[deltaPosition],
            newVNodeChildren[deltaPosition],
            oldVNodeChildren[deltaPosition],
          );
          break;
        }
        case VDeltaOperationTypes.DELETE: {
          workQueue.unshift(() => {
            el.removeChild(el.childNodes[deltaPosition]);
          });
          break;
        }
      }
    }
  } else {
    if (!newVNodeChildren) {
      workQueue.unshift(() => {
        el.textContent = '';
      });
    } else {
      if (oldVNodeChildren) {
        for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
          patch(<HTMLElement | Text>el.childNodes[i], newVNodeChildren[i], oldVNodeChildren[i]);
        }
      }
      for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length; ++i) {
        workQueue.unshift(() => {
          el.appendChild(createElement(newVNodeChildren[i], false));
        });
      }
    }
  }
};

const replaceElementWithVNode = (el: HTMLElement | Text, newVNode: VNode): void => {
  workQueue.unshift(() => {
    const newElement = createElement(newVNode);
    el.replaceWith(newElement);
  });
};

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 * @param {HTMLElement|Text} el - Target element to be modified
 * @param {VNode} newVNode - New VNode
 * @param {VNode=} prevVNode - Previous VNode
 * @returns {void}
 */
export const patch = (el: HTMLElement | Text, newVNode: VNode, prevVNode?: VNode): void => {
  if (!newVNode) workQueue.unshift(() => el.remove());

  const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
  const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

  if (hasString && oldVNode !== newVNode) {
    replaceElementWithVNode(el, newVNode);
  } else if (!hasString) {
    if (
      (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
      (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
    ) {
      if ((<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag) {
        replaceElementWithVNode(el, newVNode);
      } else if (!(el instanceof Text)) {
        patchProps(el, (<VElement>oldVNode)?.props || {}, (<VElement>newVNode).props || {});

        // Flags allow for greater optimizability by reducing condition branches.
        // Generally, you should use a compiler to generate these flags, but
        // hand-writing them is also possible
        switch (<VFlags>(<VElement>newVNode).flag) {
          case VFlags.NO_CHILDREN: {
            workQueue.unshift(() => {
              el.textContent = '';
            });
            break;
          }
          case VFlags.ONLY_TEXT_CHILDREN: {
            // Joining is faster than setting textContent to an array
            workQueue.unshift(
              () => (el.textContent = <string>(<VElement>newVNode).children!.join('')),
            );
            break;
          }
          default: {
            patchChildren(
              el,
              (<VElement>oldVNode)?.children || [],
              (<VElement>newVNode).children!,
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

  // Batch all modfications into a scheduler (diffing segregated from DOM manipulation)
  processWorkQueue(workQueue);
};
