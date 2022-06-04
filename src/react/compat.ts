import { VProps } from '../million/types';
import { hook } from './hooks';
import { patch } from '../million/render';

// eslint-disable-next-line @typescript-eslint/ban-types
export const createComponent = (fn: Function, props?: VProps, key?: string | null) => {
  // TODO: fragment support
  let prevRef: { current: any };
  const component = hook(() => {
    console.log('render');
    const newVNode = fn(props, key);

    const ref = prevRef ?? { current: undefined };

    if (ref && ref?.current) {
      patch(ref.current, newVNode);
    }
    newVNode.ref = ref;
    prevRef = ref;

    return newVNode;
  })();
  return component;
};
