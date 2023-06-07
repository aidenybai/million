import {
  createElement,
  Fragment,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  ComponentType,
} from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { Map$, MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { unwrap } from './utils';
import { Effect, RENDER_SCOPE } from './constants';
import type { Options, MillionProps } from 'packages/types';
import { Props } from 'packages/million';

export const REGISTRY = new Map$<
  (props: Props) => ReactNode,
  ReturnType<typeof createBlock>
>();

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options = {},
) => {
  const block = MapHas$.call(REGISTRY, fn)
    ? MapGet$.call(REGISTRY, fn)
    : fn
    ? createBlock(fn as any, unwrap)
    : options.block;

  function MillionBlock<P extends MillionProps>(props: P) {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key, options.shouldUpdate);
      if (ref.current && patch.current === null) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, ref.current!, null);
        });
        patch.current = (props: P) => {
          queueMicrotask$(() => {
            patchBlock(
              currentBlock,
              block(props, props.key, options.shouldUpdate),
            );
          });
        };
      }
    }, []);

    const marker = useMemo(() => {
      return createElement(RENDER_SCOPE, { ref });
    }, []);

    const vnode = createElement<P>(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );

    return vnode;
  }

  if (!MapHas$.call(REGISTRY, MillionBlock<P>)) {
    MapSet$.call(REGISTRY, MillionBlock<P>, block);
  }

  return MillionBlock<P>;
};
