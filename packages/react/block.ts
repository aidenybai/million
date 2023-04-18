import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
  remove$,
} from '../million/block';
import { Map$, MapSet$, MapHas$ } from '../million/constants';
import { unwrap } from './utils';
import type { ReactNode, FunctionComponent } from 'react';
import type { Props } from '../million';

const IS_SSR_ENVIRONMENT = typeof window === 'undefined';

interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
}

if (!IS_SSR_ENVIRONMENT) {
  const css = 'million-block, million-fragment { display: contents }';

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
}

export const REGISTRY =
  (window as any).__MILLION_REGISTRY__ ??
  new Map$<(props: Props) => ReactNode, ReturnType<typeof createBlock>>();

(window as any).__MILLION_REGISTRY__ = REGISTRY;

export const block = (
  fn: (props: Props) => ReactNode,
  options: Options = {},
) => {
  const block = createBlock(fn as any, unwrap);
  if (!MapHas$.call(REGISTRY, fn)) MapSet$.call(REGISTRY, fn, block);
  function MillionBlock(props: Props) {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: Props) => void) | null>(null);

    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key, options.shouldUpdate);
      if (ref.current) {
        mount$.call(currentBlock, ref.current, null);
        patch.current = (props: Props) => {
          patchBlock(currentBlock, block(props));
        };
      }
      return () => {
        remove$.call(currentBlock);
      };
    }, []);

    const marker = useMemo(() => {
      return createElement('million-block', { ref });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );

    return vnode;
  }

  return MillionBlock;
};

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
