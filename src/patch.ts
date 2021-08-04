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
import { schedule } from './schedule';

// @ts-expect-error Create new property on window object
const mutate = window.__m_sync ? (callback: () => void) => callback() : schedule;

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
      mutate(() => {
        el[oldPropName] = newPropValue;
      });
      skip.add(oldPropName);
    } else {
      mutate(() => {
        el.removeAttribute(oldPropName);
        delete el[oldPropName];
      });
    }
  }

  for (const newPropName of Object.keys(newProps)) {
    if (!skip.has(newPropName)) {
      mutate(() => {
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
          mutate(() => {
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
          mutate(() => {
            el.removeChild(el.childNodes[deltaPosition]);
          });
          break;
        }
      }
    }
  } else if (!newVNodeChildren) {
    mutate(() => {
      el.textContent = '';
    });
  } else {
    if (oldVNodeChildren) {
      for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
        patch(<HTMLElement | Text>el.childNodes[i], newVNodeChildren[i], oldVNodeChildren[i]);
      }
    }
    for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length; ++i) {
      mutate(() => {
        el.appendChild(createElement(newVNodeChildren[i], false));
      });
    }
  }
};

const replaceElementWithVNode = (el: HTMLElement | Text, newVNode: VNode): void => {
  mutate(() => el.replaceWith(createElement(newVNode)));
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
    mutate(() => el.remove());
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
          mutate(() => {
            patchProps(el, (<VElement>oldVNode)?.props || {}, (<VElement>newVNode).props || {});
          });

          // Flags allow for greater optimizability by reducing condition branches.
          // Generally, you should use a compiler to generate these flags, but
          // hand-writing them is also possible
          switch (<VFlags>(<VElement>newVNode).flag) {
            case VFlags.NO_CHILDREN: {
              mutate(() => {
                el.textContent = '';
              });
              break;
            }
            case VFlags.ONLY_TEXT_CHILDREN: {
              // Joining is faster than setting textContent to an array
              mutate(() => (el.textContent = <string>(<VElement>newVNode).children!.join('')));
              break;
            }
            default: {
              mutate(() => {
                patchChildren(
                  el,
                  (<VElement>oldVNode)?.children || [],
                  (<VElement>newVNode).children!,
                  // We need to pass delta here because this function does not have
                  // a reference to the actual vnode.
                  (<VElement>newVNode).delta,
                );
              });
              break;
            }
          }
        }
      }
    }
  }

  if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
};
