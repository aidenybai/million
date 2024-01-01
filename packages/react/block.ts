import { createElement, Fragment, useCallback, useRef } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { processProps, unwrap } from './utils';
import { Effect, REGISTRY } from './constants';
import type { ComponentType, Ref } from 'react';
import type { Options, MillionProps, MillionPortal } from '../types';
import { useContainer, useNearestParent } from './its-fine';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options | null | undefined
) => {
  let block: ReturnType<typeof createBlock> | null = options?.block;
  if (fn) {
    block = createBlock(
      fn as any,
      unwrap as any,
      options?.shouldUpdate,
      options?.svg
    );
  }

  const MillionBlock = <P extends MillionProps>(
    props: P,
    forwardedRef: Ref<any>
  ) => {
    const container = useContainer<HTMLElement>() // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>()

    const hmrTimestamp = props._hmr;
    const patch = useRef<((props: P) => void) | null>(null);
    const portalRef = useRef<MillionPortal[]>([]);

    props = processProps(props, forwardedRef, portalRef.current);
    patch.current?.(props);

    const effect = useCallback(() => {
      const target = parentRef.current ?? container.current
      if (!target) return;
      const currentBlock = block!(props, props.key);
      if (hmrTimestamp && target.textContent) {
        target.textContent = '';
      }
      if (patch.current === null || hmrTimestamp) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, target, null);
        });
        patch.current = (props: P) => {
          queueMicrotask$(() => {
            patchBlock(
              currentBlock,
              block!(props, props.key, options?.shouldUpdate)
            );
          });
        };
      }
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);
   
    children[0] = createElement(Effect, {
      effect,
      deps: hmrTimestamp ? [hmrTimestamp] : [],
    });
    for (let i = 0; i < childrenSize; ++i) {
      children[i + 1] = portalRef.current[i]?.portal;
    }

    const vnode = createElement(Fragment, { children });

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  return MillionBlock<P>;
};
