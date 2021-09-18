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
 */
export const patchProps = (
  el: HTMLElement,
  oldProps: VProps,
  newProps: VProps,
  workStack: (() => void)[],
): (() => void)[] => {
  // Subsequent spreads will overwrite original spreads
  // e.g. { ...{ foo: 'bar' }, ...{ foo: 'baz' } } becomes { foo: 'baz' }
  for (const propName in { ...oldProps, ...newProps }) {
    const oldPropValue = oldProps[propName];
    const newPropValue = newProps[propName];

    if (oldPropValue === newPropValue) continue;
    if (propName.startsWith('on')) {
      const eventPropName = propName.slice(2).toLowerCase();
      workStack.push(() => {
        if (oldPropValue) el.removeEventListener(eventPropName, <EventListener>oldPropValue);
        el.addEventListener(eventPropName, <EventListener>newPropValue);
      });
    } else if (el[propName] !== undefined && !(el instanceof SVGElement)) {
      if (newPropValue) {
        workStack.push(() => (el[propName] = newPropValue));
      } else {
        workStack.push(() => {
          el.removeAttribute(propName);
          delete el[propName];
        });
      }
    } else if (!newPropValue) {
      workStack.push(() => el.removeAttribute(propName));
    } else {
      workStack.push(() => el.setAttribute(propName, String(newPropValue)));
    }
  }

  return workStack;
};

/**
 * Diffs two VNode children and modifies the DOM node based on the necessary changes
 */
export const patchChildren = (
  el: HTMLElement,
  oldVNodeChildren: VNode[],
  newVNodeChildren: VNode[],
  keyed: boolean,
  delta: VDelta | undefined,
  workStack: (() => void)[],
): (() => void)[] => {
  if (!newVNodeChildren) {
    workStack.push(() => (el.textContent = ''));
  } else if (delta) {
    for (let i = 0; i < delta.length; ++i) {
      const [deltaType, deltaPosition] = delta[i];
      const child = el.childNodes[deltaPosition];
      switch (deltaType) {
        case VDeltaOperationTypes.INSERT:
          workStack.push(() =>
            el.insertBefore(createElement(newVNodeChildren[deltaPosition]), child),
          );
          break;
        case VDeltaOperationTypes.UPDATE:
          patch(
            <HTMLElement | Text>child,
            newVNodeChildren[deltaPosition],
            oldVNodeChildren[deltaPosition],
            workStack,
          );
          break;
        case VDeltaOperationTypes.DELETE:
          workStack.push(() => el.removeChild(child));
          break;
      }
    }
  } else if (keyed && oldVNodeChildren.length > 0) {
    let oldHead = 0;
    let newHead = 0;
    let oldTail = oldVNodeChildren.length - 1;
    let newTail = newVNodeChildren.length - 1;

    // Constrain tails to dirty vnodes: [X, A, B, C], [Y, A, B, C] -> [X], [Y]
    while (oldHead <= oldTail && newHead <= newTail) {
      if ((<VElement>oldVNodeChildren[oldTail]).key !== (<VElement>newVNodeChildren[newTail]).key) {
        break;
      }
      oldTail--;
      newTail--;
    }

    // Constrain heads to dirty vnodes: [A, B, C, X], [A, B, C, Y] -> [X], [Y]
    while (oldHead <= oldTail && newHead <= newTail) {
      if ((<VElement>oldVNodeChildren[oldHead]).key !== (<VElement>newVNodeChildren[newHead]).key) {
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
          // Determine move for child that moved: [X, A, B, C] -> [A, B, C, X]
          workStack.push(() => el.insertBefore(node, el.childNodes[newPosition]));
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
  } else {
    if (oldVNodeChildren) {
      // Interates backwards, so in case a childNode is destroyed, it will not shift the nodes
      // and break accessing by index
      for (let i = oldVNodeChildren.length - 1; i >= 0; --i) {
        patch(
          <HTMLElement | Text>el.childNodes[i],
          newVNodeChildren[i],
          oldVNodeChildren[i],
          workStack,
        );
      }
    }
    for (let i = oldVNodeChildren.length ?? 0; i < newVNodeChildren.length; i++) {
      const node = createElement(newVNodeChildren[i], false);
      workStack.push(() => el.appendChild(node));
    }
  }

  return workStack;
};

export const flushWorkStack = (
  workStack: (() => void)[],
  commit: (callback: () => void) => void = (callback: () => void): void => callback(),
): void => {
  for (let i = 0; i < workStack.length; ++i) {
    commit(workStack[i]);
  }
};

/**
 * Creates a custom patch function
 */
export const init =
  (
    customPatchProps: typeof patchProps = patchProps,
    customPatchChildren: typeof patchChildren = patchChildren,
    ...effects: ((
      el?: HTMLElement | Text,
      newVNode?: VNode,
      prevVNode?: VNode,
      workStack?: (() => void)[],
    ) => void)[]
  ) =>
  (
    el: HTMLElement | Text,
    newVNode: VNode,
    prevVNode?: VNode,
    workStack: (() => void)[] = [],
    commit?: (callback: () => void) => void,
  ): HTMLElement | Text => {
    const finish = () => {
      workStack.push(() => {
        if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
      });
      flushWorkStack(workStack, commit);
    };

    if (!newVNode) {
      workStack.push(() => el.remove());
      finish();
      return el;
    } else {
      const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

      if (hasString && oldVNode !== newVNode) {
        const newEl = createElement(newVNode);
        workStack.push(() => el.replaceWith(newEl));
        finish();
        return newEl;
      } else if (!hasString) {
        if (
          (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
          (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
        ) {
          if ((<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag || el instanceof Text) {
            const newEl = createElement(newVNode);
            workStack.push(() => el.replaceWith(newEl));
            finish();
            return newEl;
          } else {
            customPatchProps(
              el,
              (<VElement>oldVNode)?.props || {},
              (<VElement>newVNode).props || {},
              workStack,
            );

            // Flags allow for greater optimizability by reducing condition branches.
            // Generally, you should use a compiler to generate these flags, but
            // hand-writing them is also possible
            switch (<VFlags>(<VElement>newVNode).flag) {
              case VFlags.NO_CHILDREN:
                workStack.push(() => (el.textContent = ''));
                break;
              case VFlags.ONLY_TEXT_CHILDREN:
                // Joining is faster than setting textContent to an array
                workStack.push(
                  () => (el.textContent = <string>(<VElement>newVNode).children!.join('')),
                );
                break;
              default:
                customPatchChildren(
                  el,
                  (<VElement>oldVNode)?.children || [],
                  (<VElement>newVNode).children!,
                  <VFlags>(<VElement>newVNode).flag === VFlags.ONLY_KEYED_CHILDREN,
                  // We need to pass delta here because this function does not have
                  // a reference to the actual vnode.
                  (<VElement>newVNode).delta,
                  workStack,
                );
                break;
            }
          }
        }

        if (effects.length > 0) {
          for (let i = 0; i < effects.length; ++i) {
            effects[i](el, newVNode, oldVNode, workStack);
          }
        }
      }
    }

    finish();
    return el;
  };

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = init();
