import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$, } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { processProps, unwrap } from './utils';
<<<<<<< HEAD
import { Effect, RENDER_SCOPE } from './constants';
import type { ReactNode } from 'react';
import type { Options, MillionProps } from '../types';

export const REGISTRY = new Map$<
  (props: MillionProps) => ReactNode,
  ReturnType<typeof createBlock>
>();

export const block = <P extends MillionProps>(
  fn: (props: P) => JSX.Element,
  options: Options = {},
) => {
  const block = MapHas$.call(REGISTRY, fn)
    ? MapGet$.call(REGISTRY, fn)
    : fn
    ? createBlock(fn, unwrap)
    : options.block;
  
  function MillionBlock<P extends MillionProps>(props: P) {
=======
import { Effect, RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';
import type { ComponentType } from 'react';
import type { Options, MillionProps } from '../types';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  { block: compiledBlock, shouldUpdate, svg, original }: Options = {},
) => {
  const block = fn
    ? createBlock(fn as any, unwrap, shouldUpdate, svg)
    : compiledBlock;

  const MillionBlock = <P extends MillionProps>(props: P) => {
>>>>>>> main
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    props = processProps(props);
    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key);
      if (ref.current && patch.current === null) {
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
      return createElement(svg ? SVG_RENDER_SCOPE : RENDER_SCOPE, {
        ref,
      });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  const hoc = MillionBlock<P>;
  (hoc as any).original = original;
  return hoc;
};
