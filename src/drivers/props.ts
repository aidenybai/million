import { VDriver, VElement, VTask } from '../types/base';

export const updateProp = (
  el: HTMLElement | SVGElement,
  propName: string,
  oldPropValue: unknown,
  newPropValue: unknown,
  workStack: VTask[],
): void => {
  if (oldPropValue === newPropValue) return;
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
        el[propName] = '';
        el.removeAttribute(propName);
        delete el[propName];
      });
    }
  } else if (!newPropValue) {
    workStack.push(() => el.removeAttribute(propName));
  } else {
    workStack.push(() => el.setAttribute(propName, String(newPropValue)));
  }
};

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 */
export const props =
  (): Partial<VDriver> =>
  (
    el: HTMLElement | SVGElement,
    newVNode: VElement,
    oldVNode?: VElement,
    workStack: VTask[] = [],
  ): ReturnType<VDriver> => {
    const oldProps = oldVNode?.props;
    const newProps = newVNode?.props;
    if (oldProps !== newProps) {
      // Zero props optimization
      if (oldProps === undefined || newProps === null) {
        for (const propName in newProps) {
          updateProp(el, propName, undefined, newProps[propName], workStack);
        }
      } else if (newProps === undefined || newProps === null) {
        for (const propName in oldProps) {
          updateProp(el, propName, oldProps[propName], undefined, workStack);
        }
      } else {
        let matches = 0;
        for (const propName in oldProps!) {
          updateProp(
            el,
            propName,
            oldProps[propName],
            // Keep track the number of matches with newProps
            Object.prototype.hasOwnProperty.call(newProps, propName)
              ? (matches++, newProps![propName])
              : undefined,
            workStack,
          );
        }

        const keys = Object.keys(newProps!);
        // Limit to number of matches to reduce the number of iterations
        for (let i = 0; matches < keys.length && i < keys.length; ++i) {
          const propName = keys[i];
          if (!Object.prototype.hasOwnProperty.call(oldProps, propName)) {
            updateProp(el, propName, undefined, newProps![propName], workStack);
            ++matches;
          }
        }
      }
    }

    return {
      el,
      newVNode,
      oldVNode,
      workStack,
    };
  };
