import {
  Fragment,
  createElement,
  forwardRef,
  memo,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  createContext,
} from 'react';
import type { DispatchWithoutAction, MutableRefObject } from 'react';
import { arrayMount$, arrayPatch$ } from '../million/array';
import { mapArray, block as createBlock } from '../million';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import type { Block } from '../million';
import type {
  ArrayCache,
  MillionArrayProps,
  MillionPortal,
  MillionProps,
} from '../types';
import { renderReactScope } from './utils';
import { REGISTRY } from './constants';
import { useContainer, useNearestParent } from './its-fine';

export const mountContext = createContext<React.Dispatch<boolean> | null>(
  null as any
);

const MillionArray = <T>({
  each,
  children,
  memo,
  scoped,
}: MillionArrayProps<T>): ReturnType<typeof createElement> => {
  scoped = false
  const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
  const parentRef = useNearestParent<HTMLElement>();

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
  const [, rerender] = useReducer(() => Symbol(), Symbol());
  const setMounted = useContext(mountContext);

  if (fragmentRef.current && (each !== cache.current.each || !memo)) {
    queueMicrotask$(() => {
      if (scoped) {
        parentRef.current = undefined;
      }
      const el = parentRef.current ?? container.current;
      const prevPortalsLength = portals.current.length
      const newChildren = createChildren<T>(
        each,
        children,
        cache,
        portals,
        memo,
        el,
        rerender
      );
      arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
    });
  }

  const MillionFor = createElement(
    Fragment,
    null,
    ...portals.current.map((p) => p.portal)
  );
  console.log('render phase', portals.current.length)

  useEffect(() => {
    if (fragmentRef.current) return;

    queueMicrotask$(() => {
      if (scoped) {
        parentRef.current = undefined;
      }

      const el = parentRef.current ?? container.current;
      if (cache.current.mounted) return;

      const newChildren = createChildren<T>(
        each,
        children,
        cache,
        portals,
        memo,
        el,
        rerender
      );
      fragmentRef.current = mapArray(newChildren);
      if (!MapHas$.call(REGISTRY, MillionFor)) {
        MapSet$.call(REGISTRY, MillionFor, fragmentRef.current);
      }
      arrayMount$.call(fragmentRef.current, el!);
      cache.current.mounted = true;
      setMountPortals(true);
      setMounted?.(true);
    });
  }, [parentRef.current, container.current]);

  return MillionFor;
};

// Using fix below to add type support to MillionArray
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
const typedMemo: <T>(
  component: T,
  equal?: (oldProps: MillionProps, newProps: MillionProps) => boolean
) => T = memo;

export const For = typedMemo(MillionArray);

const createChildren = <T>(
  each: T[],
  getComponent: (value: T, i: number) => JSX.Element,
  cache: MutableRefObject<ArrayCache<T>>,
  portals: { current: MillionPortal[] },
  memo = false,
  parentEl: Element,
  rerender: DispatchWithoutAction
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
      children[i] = currentCache.block!(vnode.props, i);
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
      index: number
    ): ReturnType<typeof block> => {
      return block(
        {
          scope: renderReactScope(
            createElement(vnode.type, props),
            false,
            portals.current,
            index,
            parentEl,
            rerender
          ),
        },
        vnode.key ? String(vnode.key) : undefined
      );
    };

    MapSet$.call(REGISTRY, vnode.type, currentBlock);
    currentCache.block = currentBlock as any;
    children[i] = currentBlock(vnode.props, i);
  }
  currentCache.each = each;
  currentCache.children = children;
  return children;
};
