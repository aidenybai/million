import { VDriver, VElement, VProps, VTask } from '../types/base';

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 */
export const props =
  (): VDriver =>
  // @ts-expect-error Subset of VDriver
  (
    el: HTMLElement | SVGElement,
    newVNode: VElement,
    oldVNode?: VElement,
    workStack: VTask[] = [],
  ): ReturnType<VDriver> => {
    const oldProps: VProps = oldVNode?.props ?? {};
    const newProps: VProps = newVNode.props ?? {};

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
    }

    return {
      el,
      newVNode,
      oldVNode,
      workStack,
    };
  };
