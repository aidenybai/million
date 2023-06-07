import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { arrayMount$, arrayPatch$ } from '../million/array';
import { mapArray, block as createBlock } from '../million';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { RENDER_SCOPE } from '../react/constants';
import { REGISTRY } from './block';
import { renderPreactScope } from './utils';
import type { Props } from '../million';
import type { FunctionComponent as FC, RefObject } from 'preact';
import type { ArrayCache, MillionArrayProps } from '../react/types';

export const For: FC<MillionArrayProps> = ({ each, children }) => {
  const ref = useRef<HTMLElement>(null);
  const fragmentRef = useRef<ReturnType<typeof mapArray> | null>(null);
  const cache = useRef<ArrayCache>({
    each: null,
    children: null,
  });
  if (fragmentRef.current && each !== cache.current.each) {
    queueMicrotask$(() => {
      const newChildren = createChildren(each, children, cache);
      arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
    });
  }
  useEffect(() => {
    if (fragmentRef.current) return;
    queueMicrotask$(() => {
      const newChildren = createChildren(each, children, cache);
      fragmentRef.current = mapArray(newChildren);
      arrayMount$.call(fragmentRef.current, ref.current!);
    });
  }, []);

  return h(RENDER_SCOPE as any, { ref });
};

const createChildren = (
  each: any[],
  getComponent: any,
  cache: RefObject<ArrayCache>,
) => {
  const children = Array(each.length);
  const currentCache = cache.current!;
  for (let i = 0, l = each.length; i < l; ++i) {
    if (currentCache.each && currentCache.each[i] === each[i]) {
      children[i] = currentCache.children?.[i];
      continue;
    }
    const vnode = getComponent(each[i], i);

    if (MapHas$.call(REGISTRY, vnode.type)) {
      if (!currentCache.block) {
        currentCache.block = MapGet$.call(REGISTRY, vnode.type)!;
      }
      children[i] = cache.current?.block(vnode.props);
    } else {
      const block = createBlock((props?: Props) => {
        return {
          type: RENDER_SCOPE,
          props: { children: [props?.__scope] },
        } as any;
      });
      const currentBlock = (props: Props) => {
        return block({
          props,
          __scope: renderPreactScope(h(vnode.type, props)),
        });
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
