import type { ComponentType, Ref } from 'react';
import { Fragment, createElement, useCallback, useMemo, useRef } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapHas$, MapSet$ } from '../million/constants';
import type { MillionPortal, MillionProps, Options } from '../types';
import { Effect, REGISTRY, RENDER_SCOPE, SVG_RENDER_SCOPE } from './constants';
import { processProps, unwrap } from './utils';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options<P> | null | undefined = {},
) => {
  console.log('here')
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
      const currentBlock = blockTarget!(props, props.key);
      if (hmrTimestamp && ref.current.textContent) {
        ref.current.textContent = '';
      }
      if (patch.current === null || hmrTimestamp) {
        mount$.call(currentBlock, ref.current, null);
        patch.current = (props: P) => {
          patchBlock(
            currentBlock,
            blockTarget!(
              props,
              props.key,
              options?.shouldUpdate as Parameters<typeof createBlock>[2],
            ),
          );
        };
      }
    }, []);

    const marker = useMemo(() => {
      return createElement(options?.as ?? defaultType, { ref });
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);
    for (let i = 0; i < childrenSize; ++i) {
      children[i] = portalRef.current[i]?.portal;
    }

    const vnode = createElement(Fragment, {}, marker, createElement(Effect, {
      effect,
      deps: hmrTimestamp ? [hmrTimestamp] : [],
    }), children);

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
