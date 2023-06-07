import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { Map$, MapSet$, MapHas$, MapGet$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { unwrap } from './utils';
import { css, Effect, RENDER_SCOPE } from './constants';
import type { Options } from './types';
import type { Props } from '../million';
import type { ReactNode, ComponentType } from 'react';

// @ts-expect-error - CSSStyleSheet is not supported on Safari
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (CSSStyleSheet.prototype.replaceSync) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [sheet];
} else {
  const style = document.createElement('style');
  document.head.appendChild(style);
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
}

export const REGISTRY = new Map$<
  (props: Props) => ReactNode,
  ReturnType<typeof createBlock>
>();

export const block = (fn: ComponentType<any> | null, options: Options = {}) => {
  const block = MapHas$.call(REGISTRY, fn)
    ? MapGet$.call(REGISTRY, fn)
    : fn
    ? createBlock(fn as any, unwrap)
    : options.block;

  function MillionBlock(props: Props) {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: Props) => void) | null>(null);

    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key, options.shouldUpdate);
      if (ref.current && patch.current === null) {
        queueMicrotask$(() => {
          mount$.call(currentBlock, ref.current!, null);
        });
        patch.current = (props: Props) => {
          queueMicrotask$(() => {
            patchBlock(currentBlock, block(props));
          });
        };
      }
    }, []);

    const marker = useMemo(() => {
      return createElement(RENDER_SCOPE, { ref });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );

    return vnode;
  }

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  return MillionBlock;
};
