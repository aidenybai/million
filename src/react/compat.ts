import { h } from '../jsx-runtime/h';
import { patch } from '../million/render';
import { VNode, VProps } from '../million/types';
import { hook } from './hooks';
import { Component } from './react';

// eslint-disable-next-line @typescript-eslint/ban-types
export const createComponent = (fn: Function, props?: VProps, key?: string | null) => {
  let prevRef: { current: any };
  let prevVNode: VNode | undefined;
  let prevKey: string | undefined;

  const component = hook(() => {
    const ret = fn(props, key);
    const newVNode = Array.isArray(ret) ? h('_', { key }, ...ret) : ret;
    const ref = prevRef ?? { current: undefined };

    // Handle nested components
    if (!prevRef && newVNode.ref) return newVNode;
    if (ref && ref?.current) {
      if (prevKey && newVNode.key) {
        if (prevKey === newVNode.key) patch(ref.current, newVNode, prevVNode);
      } else {
        patch(ref.current, newVNode, prevVNode);
      }
    }
    if (!newVNode.ref) {
      newVNode.ref = ref;
      prevRef = ref;
    }
    prevKey = newVNode.key;
    prevVNode = newVNode;
    return newVNode;
  })();
  return component;
};

export const createClass = (ClassComponent: typeof Component, props?: VProps) => {
  let prevRef: { current: any };
  let prevVNode: VNode | undefined;
  const componentObject = new ClassComponent(props as VProps, null);
  const rerender = () => {
    const ret = componentObject.render(props) as VNode | undefined;
    const newVNode = Array.isArray(ret) ? h('_', {}, ...ret) : ret;

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

// eslint-disable-next-line @typescript-eslint/ban-types
export const compat = <T>(jsxFactoryRaw: Function): T => {
  return jsxFactoryRaw.bind({ handleFunction: createComponent, handleClass: createClass });
};
