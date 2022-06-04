import { patch } from '../million/render';
import { VNode, VProps } from '../million/types';
import { hook } from './hooks';
import { Component } from './react';

// eslint-disable-next-line @typescript-eslint/ban-types
export const createComponent = (fn: Function, props?: VProps, key?: string | null) => {
  let prevRef: { current: any };
  let prevVNode: VNode | undefined;
  const component = hook(() => {
    const newVNode = fn(props, key);

    const ref = prevRef ?? { current: undefined };
    if (ref && ref?.current) {
      patch(ref.current, newVNode, prevVNode);
    }
    newVNode.ref = ref;
    prevRef = ref;
    prevVNode = newVNode;
    return newVNode;
  })();
  return component;
};

export const createClass = (ClassComponent: typeof Component, props?: VProps) => {
  let prevRef: { current: any };
  let prevVNode: VNode | undefined;
  const componentObject = new ClassComponent(props as Record<string, any>, null);
  const rerender = () => {
    const newVNode = componentObject.render(props) as VNode | undefined;

    const ref = prevRef ?? { current: undefined };
    if (ref && ref?.current) {
      patch(ref.current, newVNode, prevVNode);
    }

    if (newVNode && typeof newVNode === 'object') newVNode.ref = ref;
    prevRef = ref;
    prevVNode = newVNode;
    return newVNode;
  };
  componentObject.rerender = rerender;
  return rerender();
};
