import { VElement, VProps, VTask } from '../structs';

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 */
export const propsDriver = (
  el: HTMLElement,
  newVNode: VElement,
  oldVNode: VElement | undefined,
  workStack: VTask[],
): VTask[] => {
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
