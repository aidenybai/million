import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import type { ComponentType, Ref } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import type { Options, MillionProps, MillionPortal } from '../types';
import { processProps, unwrap } from './utils';
import { useContainer, useNearestParent, useNearestParentInstant } from './its-fine';
import { Effect, REGISTRY } from './constants';
import afterFrame from 'afterframe';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options | null | undefined = {},
) => {
  let block: ReturnType<typeof createBlock> | null = options?.block;
  if (fn) {
    block = createBlock(
      fn as any,
      unwrap as any,
      options?.shouldUpdate,
      options?.svg,
    );
  }

  const MillionBlock = <P extends MillionProps>(
    props: P,
    forwardedRef: Ref<any>,
  ) => {
    const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>();

    const hmrTimestamp = props._hmr;
    const patch = useRef<((props: P) => void) | null>(null);
    const portalRef = useRef<MillionPortal[]>([]);

    props = processProps(props, forwardedRef, portalRef.current);
    patch.current?.(props);

    const effect = useCallback(() => {
      const target = parentRef.current ?? container.current;
      if (!target) return;
      const currentBlock = block!(props, props.key);
      // if (hmrTimestamp && target.textContent) {
      //   target.textContent = '';
      // }
      if (patch.current === null || hmrTimestamp) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, target, null);
        });
        patch.current = (props: P) => {
          afterFrame(() => {
            patchBlock(
              currentBlock,
              block!(props, props.key, options?.shouldUpdate),
            );
          });
        };
      }
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);

    children[0] = createElement(Effect, {
      key: 0 + hmrTimestamp,
      effect,
      deps: hmrTimestamp ? [hmrTimestamp] : [],
    });
    for (let i = 0; i < childrenSize; ++i) {
      children[i + 1] = portalRef.current[i]?.portal;
    }
    console.log(children, portalRef)

    const vnode = createElement(Fragment, { children });

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  return MillionBlock<P>;
};
