import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { processProps, unwrap } from './utils';
import { Effect, RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';
import type { ComponentType, Ref } from 'react';
import type { Options, MillionProps, MillionPortal } from '../types';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  { block: compiledBlock, shouldUpdate, svg, as }: Options = {},
) => {
  const block = fn
    ? createBlock(fn as any, unwrap as any, shouldUpdate, svg)
    : compiledBlock;
  const defaultType = svg ? SVG_RENDER_SCOPE : RENDER_SCOPE;

  const MillionBlock = <P extends MillionProps>(
    props: P,
    forwardedRef: Ref<any>,
  ) => {
    const hmrTimestamp = props._hmr;
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);
    const portalRef = useRef<MillionPortal[]>([]);

    props = processProps(props, forwardedRef, portalRef.current);
    patch.current?.(props);

    const effect = useCallback(() => {
      if (!ref.current) return;
      const currentBlock = block(props, props.key);
      console.log(hmrTimestamp);
      if (hmrTimestamp) ref.current.textContent = '';
      if (patch.current === null || hmrTimestamp) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, ref.current!, null);
        });
        patch.current = (props: P) => {
          queueMicrotask$(() => {
            patchBlock(currentBlock, block(props, props.key, shouldUpdate));
          });
        };
      }
    }, []);

    const marker = useMemo(() => {
      return createElement(as ?? defaultType, { ref });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, {
        effect,
        deps: hmrTimestamp ? [hmrTimestamp] : [],
      }),
      ...portalRef.current.map((p) => p.portal),
    );

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  return MillionBlock<P>;
};
