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
import { unwrap } from './preprocess';
import type {
  FunctionComponentElement,
  ReactNode,
  FunctionComponent,
} from 'react';
import type { Props } from '../million';

interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
}

const sheet = new CSSStyleSheet();
sheet.replaceSync('million-island, million-fragment { display: contents }');
document.adoptedStyleSheets = [sheet];

export const island = (
  fn: (props: Props) => ReactNode,
  options: Options = {},
) => {
  const block = createBlock(fn as any, unwrap);
  const MillionIsland = (props: Props): FunctionComponentElement<Props> => {
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
      return createElement('million-island', { ref });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );

    return vnode;
  };

  (MillionIsland as any).__block = block;

  return MillionIsland;
};

export const Island: FunctionComponent<
  Props & { children: (props: Props) => ReactNode }
> = ({ children, ...props }) => {
  const ref = useRef<ReturnType<typeof island> | null>(null);
  if (!ref.current) {
    ref.current = island(children);
  }
  return createElement(ref.current, props);
};

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
