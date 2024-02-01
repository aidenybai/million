import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import type { ComponentType, Ref } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$, removeComments } from '../million/dom';
import type { Options, MillionProps, MillionPortal } from '../types';
import { processProps, unwrap } from './utils';
import { Effect, RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options<P> | null | undefined = {}
) => {
  let blockTarget: ReturnType<typeof createBlock> | null = options?.block;
  const defaultType = options?.svg ? SVG_RENDER_SCOPE : RENDER_SCOPE;

  if (fn) {
    blockTarget = createBlock(
      fn as any,
      unwrap as any,
      options?.shouldUpdate as Parameters<typeof createBlock>[2],
      options?.svg,
    );
  }

  const MillionBlock = <P extends MillionProps>(
    props: P,
    forwardedRef: Ref<any>
  ) => {
    const hmrTimestamp = props._hmr;
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);
    const portalRef = useRef<MillionPortal[]>([]);

    props = processProps(props, forwardedRef, portalRef.current);
    patch.current?.(props);

    const effect = useCallback(() => {
      if (!ref.current) return;
      const currentBlock = blockTarget!(props, props.key);
      if (hmrTimestamp && ref.current.textContent) {
        ref.current.textContent = '';
      }
      if (patch.current === null || hmrTimestamp) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, ref.current!, null);
        });
        patch.current = (props: P) => {
          queueMicrotask$(() => {
            patchBlock(
              currentBlock,
              blockTarget!(props, props.key, options?.shouldUpdate  as Parameters<typeof createBlock>[2])
            );
          });
        };
      }
    }, []);

    const marker = useMemo(() => {
      return createElement(options?.as ?? defaultType, { ref });
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);

    children[0] = marker;
    children[1] = createElement(Effect, {
      effect,
      deps: hmrTimestamp ? [hmrTimestamp] : [],
    });
    for (let i = 0; i < childrenSize; ++i) {
      children[i + 2] = portalRef.current[i]?.portal;
    }

    const vnode = createElement(Fragment, { children });

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }


  // TODO add dev guard
  if (options?.name) {
    if (fn) {
      fn.displayName = `Million(Render(${options.name}))`;
    }
    MillionBlock.displayName = `Million(Block(${options.name}))`;
  }

  return MillionBlock<P>;
};
