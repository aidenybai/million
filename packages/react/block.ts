import {
  createElement,
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { unwrap } from './utils';
import { Effect, RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';
import type { ComponentType } from 'react';
import type { Options, MillionProps } from '../types';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  { block: compiledBlock, shouldUpdate, svg }: Options = {},
) => {
  const blockFn = MapHas$.call(REGISTRY, fn)
    ? MapGet$.call(REGISTRY, fn)
    : fn
    ? createBlock(fn, unwrap, shouldUpdate, svg)
    : compiledBlock;

  const MillionBlock = <P extends MillionProps>(props: P) => {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    useEffect(() => {
      const currentBlock = blockFn(props, props.key);
      if (ref.current && patch.current === null) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, ref.current!, null);
        });
        patch.current = (props: P) => {
          queueMicrotask$(() => {
            patchBlock(currentBlock, blockFn(props, props.key, shouldUpdate));
          });
        };
      }
    }, [blockFn, props, shouldUpdate]);

    const marker = useMemo(() => {
      return createElement(svg ? SVG_RENDER_SCOPE : RENDER_SCOPE, {
        ref,
      });
    }, [svg]);

    return createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect: useCallback(() => {}, []) }),
    );
  };

  if (!MapHas$.call(REGISTRY, fn)) {
    MapSet$.call(REGISTRY, fn, blockFn);
  }

  return MillionBlock;
};
