import { createElement, memo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { FC, ReactNode } from 'react';
import { arrayMount$, arrayPatch$, arrayRemove$ } from '../million/array';
import { mapArray, block as createBlock } from '../million';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import type { Props } from '../million';
import { REGISTRY } from './block';

const createChildren = (each: any[], getComponent: any) => {
  const children = Array(each.length);
  for (let i = 0, l = each.length; i < l; ++i) {
    const vnode = getComponent(each[i], i);

    if (MapHas$.call(REGISTRY, vnode.type)) {
      const registeredComponent = MapGet$.call(REGISTRY, vnode.type)!;
      children[i] = registeredComponent(vnode.props);
    } else {
      const block = createBlock((props?: Props) => {
        return {
          type: 'million-block',
          props: { children: [props?.__l] },
        } as any;
      });
      const registeredComponent = (props: Props) => {
        return block({
          props,
          __l: (el: HTMLElement) => {
            createRoot(el).render(createElement(vnode.type, props));
          },
        });
      };

      MapSet$.call(REGISTRY, vnode.type, registeredComponent);
      children[i] = registeredComponent(vnode.props);
    }
  }
  return children;
};

const MillionArray: FC<{
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
    const newChildren = createChildren(each, children);
    fragmentRef.current = mapArray(newChildren);
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
