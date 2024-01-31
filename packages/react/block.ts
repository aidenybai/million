import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import type { ComponentType, Ref } from 'react';
import {
  block as createBlock,
  mount$,
  remove$ as removeBlock,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$, remove$ } from '../million/dom';
import type { Options, MillionProps, MillionPortal } from '../types';
import { processProps, unwrap } from './utils';
import { useContainer, useNearestParent, useNearestParentInstant } from './its-fine';
import { Effect, REGISTRY } from './constants';
import afterFrame from 'afterframe';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options | null | undefined = {},
) => {
  let blockTarget: ReturnType<typeof createBlock> | null = options?.block;
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
      const currentBlock = blockTarget!(props, props.key);
      if (hmrTimestamp) {
        // TODO: in compiledBlock, hmr is not supported and it does not pass hmr timestamp
        removeBlock.call(currentBlock)
        // target.textContent = '';
      }
      if (patch.current === null || hmrTimestamp) {
        afterFrame(() => {
          mount$.call(currentBlock, target, null);
        });
        patch.current = (props: P) => {
          afterFrame(() => {
            patchBlock(
              currentBlock,
              blockTarget!(props, props.key, options?.shouldUpdate  as Parameters<typeof createBlock>[2])
            );
          });
        };
      }
      return () => {
        removeBlock.call(currentBlock)
      }
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);

    children[0] = createElement(Effect, {
      key: 0,
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
    MapSet$.call(REGISTRY, MillionBlock, blockTarget);
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
