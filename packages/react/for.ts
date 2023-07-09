import { createElement, memo, useEffect, useRef } from 'react';
import { arrayMount$, arrayPatch$ } from '../million/array';
import { mapArray, block as createBlock } from '../million';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { renderReactScope } from './utils';
import { RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';
import type { Props } from '../million';
import type { MutableRefObject } from 'react';
import type { ArrayCache, MillionArrayProps } from '../types';

const MillionArray = <T>({
  each,
  children,
  memo,
  svg,
}: MillionArrayProps<T>) => {
  const ref = useRef<HTMLElement>(null);
  const fragmentRef = useRef<ReturnType<typeof mapArray> | null>(null);
  const cache = useRef<ArrayCache<T>>({
    each: null,
    children: null,
  });
  if (fragmentRef.current && (each !== cache.current.each || !memo)) {
    queueMicrotask$(() => {
      const newChildren = createChildren<T>(each, children, cache, memo);
      arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
    });
  }
  useEffect(() => {
    if (fragmentRef.current) return;
    queueMicrotask$(() => {
      const newChildren = createChildren<T>(each, children, cache, memo);
      fragmentRef.current = mapArray(newChildren);
      arrayMount$.call(fragmentRef.current, ref.current!);
    });
  }, []);

  return createElement(svg ? SVG_RENDER_SCOPE : RENDER_SCOPE, { ref });
};

// Using fix below to add type support to MillionArray
//https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
const typedMemo: <T>(
  component: T,
  equal?: (oldProps: any, newProps: any) => boolean,
) => T = memo;

export const For = typedMemo(MillionArray);

const createChildren = <T>(
  each: T[],
  getComponent: any,
  cache: MutableRefObject<ArrayCache<T>>,
  memo?: boolean,
) => {
  const children = Array(each.length);
  const currentCache = cache.current;
  for (let i = 0, l = each.length; i < l; ++i) {
    if (memo && currentCache.each && currentCache.each[i] === each[i]) {
      children[i] = currentCache.children?.[i];
      continue;
    }
    const vnode = getComponent(each[i], i);

    if (MapHas$.call(REGISTRY, vnode.type)) {
      if (!currentCache.block) {
        currentCache.block = MapGet$.call(REGISTRY, vnode.type)!;
      }
      children[i] = currentCache.block!(vnode.props);
    } else {
      const block = createBlock((props?: Props) => {
        return {
          type: RENDER_SCOPE,
          props: { children: [props?.__scope] },
        } as any;
      });
      const currentBlock = (props: Props) => {
        return block(
          {
            props,
            __scope: renderReactScope(createElement(vnode.type, props)),
          },
          vnode.key,
        );
      };

      MapSet$.call(REGISTRY, vnode.type, currentBlock);
      currentCache.block = currentBlock as ReturnType<typeof createBlock>;
      children[i] = currentBlock(vnode.props);
    }
  }
  currentCache.each = each;
  currentCache.children = children;
  return children;
};
