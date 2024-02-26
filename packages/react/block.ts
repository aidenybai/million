import { createElement, Fragment, useCallback, useMemo, useRef } from 'react';
import type { ComponentType, Ref } from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
  remove$ as removeBlock,
} from '../million/block';
import { MapHas$, MapSet$ } from '../million/constants';
import type { MillionPortal, MillionProps, Options } from '../types';
// eslint-disable-next-line camelcase
import { experimental_options } from '../experimental';
import { cloneNode$ } from '../million/dom';
import { Effect, REGISTRY, RENDER_SCOPE, SVG_RENDER_SCOPE } from './constants';
import { processProps, unwrap } from './utils';
import { useContainer, useNearestParent } from './its-fine';

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options<P> | null | undefined = {},
) => {
  // eslint-disable-next-line camelcase
  const noSlot = options?.experimental_noSlot ?? experimental_options.noSlot;
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
    const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>();
    const hmrTimestamp = props._hmr;
    const ref = useRef<HTMLElement | null>(null);
    const patch = useRef<((props: P) => void) | null>(null);
    const portalRef = useRef<MillionPortal[]>([]);

    props = processProps(props, forwardedRef, portalRef.current);
    patch.current?.(props);

    const effect = useCallback(() => {
      if (!ref.current && !noSlot) return;
      const currentBlock = blockTarget!(props, props.key);
      if (hmrTimestamp && ref.current?.textContent) {
        ref.current.textContent = '';
      }
      if (noSlot) {
        ref.current = (parentRef.current?.el ?? container.current?.el)!;
        // the parentRef depth is only bigger than container depth when we're in a portal, where the portal el is closer than the jsx parent
        if (
          props.scoped ||
          (parentRef.current &&
            container.current &&
            parentRef.current.depth > container.current.depth)
        ) {
          // in portals, parentRef is not the proper parent
          ref.current = container.current!.el!;
        }
        if (ref.current.childNodes.length) {
          // eslint-disable-next-line no-console
          console.error(
            new Error(`\`experimental_options.noSlot\` does not support having siblings at the moment.
The block element should be the only child of the \`${
              (cloneNode$.call(ref.current) as HTMLElement).outerHTML
            }\` element.
To avoid this error, \`experimental_options.noSlot\` should be false`),
          );
        }
      }
      if (patch.current === null || hmrTimestamp) {
        mount$.call(currentBlock, ref.current!, null);
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
        // mount?.(true)
      }
      return () => {
        removeBlock.call(currentBlock);
      };
    }, []);

    const marker = useMemo(() => {
      if (noSlot) {
        return null;
      }
      return createElement(options?.as ?? defaultType, { ref });
    }, []);

    const childrenSize = portalRef.current.length;
    const children = new Array(childrenSize);
    for (let i = 0; i < childrenSize; ++i) {
      children[i] = portalRef.current[i]?.portal;
    }

    const vnode = createElement(
      Fragment,
      {},
      marker,
      createElement(Effect, {
        effect,
        deps: hmrTimestamp ? [hmrTimestamp] : [],
      }),
      children,
    );

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
