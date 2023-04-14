import { createElement, memo, useEffect, useRef } from 'react';
import { arrayMount$, arrayPatch$, arrayRemove$ } from '../million/array';
import { mapArray } from '../million';
import type { FunctionComponent, ReactNode } from 'react';

const createChildren = (each: any[], getComponent: any) => {
  const children = Array(each.length);
  for (let i = 0, l = each.length; i < l; ++i) {
    const vnode = getComponent(each[i], i);
    if (vnode.type.__block) {
      children[i] = vnode.type.__block(vnode.props);
    }
  }
  return children;
};

const MillionArray: FunctionComponent<{
  each: any[];
  children: (value: any, i: number) => ReactNode;
}> = ({ each, children }) => {
  const ref = useRef<HTMLElement>(null);
  const fragmentRef = useRef<ReturnType<typeof mapArray> | null>(null);
  if (fragmentRef.current) {
    const newChildren = createChildren(each, children);
    arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
  }
  useEffect(() => {
    fragmentRef.current = mapArray(createChildren(each, children));
    arrayMount$.call(fragmentRef.current, ref.current!);
    return () => {
      arrayRemove$.call(fragmentRef.current);
    };
  }, []);

  return createElement('million-fragment', { ref });
};

export const For = memo(MillionArray, (oldProps, newProps) =>
  Object.is(newProps.each, oldProps.each),
);
