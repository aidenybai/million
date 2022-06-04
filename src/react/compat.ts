import { VProps } from '../million/types';
import { hook } from './hooks';
import { patch } from '../million/render';
import { batch, startTransition } from '../million/scheduler';

const queuePatch = batch();

// eslint-disable-next-line @typescript-eslint/ban-types
export const createComponent = (fn: Function, props?: VProps, key?: string | null) => {
  // TODO: fragment support
  let prevRef: { current: any };
  const component = hook(() => {
    const newVNode = fn(props, key);

    const ref = prevRef ?? { current: undefined };
    queuePatch(() => {
      if (ref && ref?.current) {
        startTransition(() => {
          patch(ref.current, newVNode);
        });
      }
    });
    newVNode.ref = ref;
    prevRef = ref;
    return newVNode;
  })();
  return component;
};
