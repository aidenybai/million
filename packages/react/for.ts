import {
  Fragment,
  createElement,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject } from 'react';
import { arrayMount$, arrayPatch$ } from '../million/array';
import { mapArray, block as createBlock } from '../million';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import type { Block } from '../million';
import type {
  ArrayCache,
  MillionArrayProps,
  MillionPortal,
  MillionProps,
} from '../types';
import { renderReactScope } from './utils';
import { RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';

const MillionArray = <T>({
  each,
  children,
  memo,
  svg,
  as,
  ...rest
}: MillionArrayProps<T>): ReturnType<typeof createElement> => {
  const ref = useRef<HTMLElement>(null);
  const [portals] = useState<{ current: MillionPortal[] }>(() => ({
    current: Array(each.length),
  }));
  const fragmentRef = useRef<ReturnType<typeof mapArray> | null>(null);
  const cache = useRef<ArrayCache<T>>({
    each: null,
    children: null,
    mounted: false,
  });
  const [, setMountPortals] = useState(false);

  if (fragmentRef.current && (each !== cache.current.each || !memo)) {
    // queueMicrotask$(() => {
    const newChildren = createChildren<T>(each, children, cache, portals, memo);
    arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
    // });
  }

  const defaultType = svg ? SVG_RENDER_SCOPE : RENDER_SCOPE;
  const MillionFor = createElement(
    Fragment,
    null,
    createElement(as ?? defaultType, { ...rest, ref }),
    ...portals.current.map((p) => p.portal),
  );
  // console.log(portals.current, ref.current)

  useEffect(() => {
    if (!ref.current || fragmentRef.current) return;

    // queueMicrotask$(() => {
    if (cache.current.mounted) return;

    const newChildren = createChildren<T>(each, children, cache, portals, memo);
    fragmentRef.current = mapArray(newChildren);
    if (!MapHas$.call(REGISTRY, MillionFor)) {
      MapSet$.call(REGISTRY, MillionFor, fragmentRef.current);
    }
    arrayMount$.call(fragmentRef.current, ref.current);
    cache.current.mounted = true;
    setMountPortals(true);
    // });
  }, [ref.current]);

  return MillionFor;
};

// Using fix below to add type support to MillionArray
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
const typedMemo: <T>(
  component: T,
  equal?: (oldProps: MillionProps, newProps: MillionProps) => boolean,
) => T = memo;

export const For = typedMemo(MillionArray);

const createChildren = <T>(
  each: T[],
  getComponent: (value: T, i: number) => JSX.Element,
  cache: MutableRefObject<ArrayCache<T>>,
  portals: { current: MillionPortal[] },
  memo?: boolean,
): Block[] => {
  const children = Array(each.length);
  const currentCache = cache.current as any;
  for (let i = 0, l = each.length; i < l; ++i) {
    if (memo && currentCache.each && currentCache.each[i] === each[i]) {
      children[i] = currentCache.children?.[i];
      continue;
    }
    const vnode = getComponent(each[i]!, i);

    if (MapHas$.call(REGISTRY, vnode.type)) {
      if (!currentCache.block) {
        currentCache.block = MapGet$.call(REGISTRY, vnode.type)!;
      }
      children[i] = currentCache.block!(vnode.props, portals, i);
      continue;
    }

    if (typeof vnode.type === 'function' && '_c' in vnode.type) {
      const puppetComponent = vnode.type(vnode.props);
      if (MapHas$.call(REGISTRY, puppetComponent.type)) {
        const puppetBlock = MapGet$.call(REGISTRY, puppetComponent.type)!;
        if (typeof puppetBlock === 'function') {
          children[i] = puppetBlock(puppetComponent.props);
          continue;
        }
      }
    }

    const block = createBlock((props?: MillionProps) => props?.scope);
    const currentBlock = (
      props: MillionProps,
      portals: { current: MillionPortal[] },
      index: number,
    ): ReturnType<typeof block> => {
      return block(
        {
          scope: renderReactScope(
            createElement(vnode.type, props),
            false,
            portals.current,
            index,
          ),
        },
        vnode.key ? String(vnode.key) : undefined,
      );
    };

    MapSet$.call(REGISTRY, vnode.type, currentBlock);
    currentCache.block = currentBlock as any;
    children[i] = currentBlock(vnode.props, portals, i);
  }
  currentCache.each = each;
  currentCache.children = children;
  return children;
};
