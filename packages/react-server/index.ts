import type {
  ComponentType,
  ForwardedRef,
  JSX,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';
import {
  Fragment,
  createElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect as uLE,
  useRef,
  useState,
} from 'react';
import parse from 'html-react-parser';
import { RENDER_SCOPE, SVG_RENDER_SCOPE } from '../react/constants';
import type {
  MillionArrayProps,
  MillionPortal,
  MillionProps,
  Options,
} from '../types';
import { renderReactScope } from '../react/utils';
// eslint-disable-next-line camelcase
import { experimental_options } from '../experimental';
import { useContainer, useNearestParent } from '../react/its-fine';
import { useSSRSafeId } from './utils';

const useLayoutEffect = typeof window === 'undefined' ? useEffect : uLE;
let globalInfo;

export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  options: Options<P> = {},
): ComponentType<P> => {
  // eslint-disable-next-line camelcase
  const noSlot = options.experimental_noSlot ?? experimental_options.noSlot;
  let blockFactory = globalInfo ? globalInfo.block(Component, options) : null;

  const rscBoundary = options.rsc
    ? createRSCBoundary(Component, noSlot, options.svg)
    : null;

  function MillionBlockLoader(props?: P) {
    const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>();
    const id = useSSRSafeId();
    const initializedRef = useRef(false);
    const ref = useRef<HTMLElement | null>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    const effect = useCallback(() => {
      const init = (): void => {
        if (!ref.current && !noSlot) return;

        if (noSlot) {
          ref.current = (parentRef.current?.el ?? container.current?.el)!;
          // the parentRef depth is only bigger than container depth when we're in a portal, where the portal el is closer than the jsx parent
          if (
            props?.scoped ||
            (parentRef.current &&
              container.current &&
              parentRef.current.depth > container.current.depth)
          ) {
            // in portals, parentRef is not the proper parent
            ref.current = container.current!.el;
          }
          if (ref.current.childNodes.length) {
            // eslint-disable-next-line no-console
            console.error(
              new Error(`\`experimental_options.noSlot\` does not support having siblings at the moment.
  The block element should be the only child of the \`${
    (ref.current.cloneNode() as HTMLElement).outerHTML
  }\` element.
  To avoid this error, \`experimental_options.noSlot\` should be false`),
            );
          }
        }
        const el = ref.current!;

        globalInfo.removeComments(el);

        const currentBlock = blockFactory(props, props?.key);

        globalInfo.mount(currentBlock, el, el.firstChild);
        patch.current = (newProps: P) => {
          globalInfo.patch(currentBlock, blockFactory(newProps, newProps.key));
        };
      };

      if (blockFactory && globalInfo) {
        init();
      } else if (!initializedRef.current) {
        initializedRef.current = true;
        importSource(() => {
          if (!initializedRef.current) {
            return;
          }
          blockFactory = globalInfo.block(
            Component,
            globalInfo.unwrap,
            options.shouldUpdate,
            options.svg,
          );

          init();
        });
      }

      return () => {
        // initializedRef.current = false
        blockFactory = null;
      };
    }, []);

    patch.current?.(props!);

    const vnode = createElement(
      Fragment,
      null,
      createElement(Effect, { effect }),
      rscBoundary
        ? createElement(rscBoundary, { ...props, ref } as any)
        : createSSRBoundary<P>(
            Component as any,
            props!,
            ref,
            noSlot,
            id,
            options.svg,
          ),
    );
    return vnode;
  }

  // TODO add dev guard
  if (options.name) {
    Component.displayName = `Render(Million(${options.name}))`;
    MillionBlockLoader.displayName = `Block(Million(${options.name}))`;
  }

  return MillionBlockLoader;
};

export function For<T>({ each, children, ssr, svg }: MillionArrayProps<T>) {
  const [ready, setReady] = useState(Boolean(globalInfo));

  useEffect(() => {
    if (!globalInfo) {
      importSource(() => {
        setReady(true);
      });
    }
  }, []);

  if (!ready || !globalInfo) {
    if (ssr === false) return null;
    return createElement(
      svg ? SVG_RENDER_SCOPE : RENDER_SCOPE,
      { suppressHydrationWarning: true },
      ...each.map(children),
    );
  }

  return createElement(globalInfo.For, {
    each,
    children,
    ssr,
    svg,
  });
}

function Effect({ effect }: { effect: () => void }) {
  useEffect(effect, []);
  return null;
}

export const importSource = (callback: () => void) => {
  void import('../react')
    .then(({ unwrap, INTERNALS, For, compiledBlock, removeComments }) => {
      globalInfo = {
        unwrap,
        For,
        compiledBlock,
        removeComments,
        ...INTERNALS,
      };

      callback();
    })
    .catch((e) => {
      throw new Error(`Failed to load Million.js: ${e}`);
    });
};

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  importSource(() => {});
}
const ssrElementsMap = new Map<string, ReactElement>();
export const createSSRBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
  props: P,
  ref: ForwardedRef<unknown>,
  noSlot: boolean,
  id: string,
  svg = false,
) => {
  const isServer = typeof window === 'undefined';
  if (noSlot) {
    return createElement(
      Fragment,
      null,
      createHydrationBoundary(id, 'start', isServer),

      createElement(Suspend, {
        children: createElement<P>(Component, props),
        id,
      }),
      createHydrationBoundary(id, 'end', isServer),
    );
  }
  const ssrProps = isServer
    ? {
        children: createElement<P>(Component, props),
      }
    : {
        dangerouslySetInnerHTML: {
          __html: document.getElementById(id)?.innerHTML || "",
        },
      };
  if (ssrElementsMap.has(id)) {
    return ssrElementsMap.get(id)!;
  }

  const el = createElement(svg ? SVG_RENDER_SCOPE : RENDER_SCOPE, {
    suppressHydrationWarning: true,
    ref,
    id,
    ...ssrProps,
  });
  ssrElementsMap.set(id, el);
  return el;
};

const thrown = new Map();

function Suspend({
  children,
  id,
}: PropsWithChildren<{ id: string }>): ReactNode {
  if (typeof window === 'undefined') {
    return children;
  }

  let html = '';
  const startTemplate = document.getElementById(`start-${id}`);
  const endTemplate = document.getElementById(`end-${id}`);
  if (!thrown.has(id) && startTemplate && endTemplate) {
    let el = startTemplate.nextElementSibling;
    while (el && el !== endTemplate) {
      html += el.outerHTML;
      el = el.nextElementSibling;
    }
    startTemplate.remove();
    endTemplate.remove();
    thrown.set(id, parse(html));
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw Promise.resolve();
  }
  // we can return null to avoid parsing but this would cause a flashing
  return thrown.get(id);
}

const createHydrationBoundary = (
  id: string,
  phase: 'start' | 'end',
  isSSR: boolean,
) => {
  // TODO: Better to use html commnts which are not allowed in React
  return isSSR ? createElement('template', { id: `${phase}-${id}` }) : null;
};

export const createRSCBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
  noSlot: boolean,
  svg = false,
) => {
  return memo(
    forwardRef((props: P, ref) => {
      const id = useSSRSafeId();
      return createSSRBoundary(Component, props, ref, noSlot, id, svg);
    }),
    () => true,
  );
};

function isEqual(a: unknown, b: unknown): boolean {
  // Faster than Object.is
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b);
}

function shouldCompiledBlockUpdate(
  prev: MillionProps,
  next: MillionProps,
): boolean {
  for (const key in prev) {
    if (!isEqual(prev[key], next[key])) {
      return true;
    }
  }
  return false;
}

interface CompiledBlockOptions
  extends Omit<Options<MillionProps>, 'shouldUpdate'> {
  portals?: string[];
}

// TODO Fix SSR
export function compiledBlock(
  render: (props: MillionProps) => JSX.Element,
  { portals, ...options }: CompiledBlockOptions,
): ComponentType<MillionProps> {
  const RenderBlock = block<MillionProps>((props) => render(props), {
    ...options,
    name: `CompiledBlock(Inner(${options.name}))`,
    shouldUpdate: shouldCompiledBlockUpdate,
  });

  const portalCount = portals?.length || 0;

  const Component: ComponentType<MillionProps> =
    portals && portalCount > 0
      ? (props: MillionProps) => {
          const id = useSSRSafeId();
          const [current] = useState<MillionPortal[]>(() => []);
          const [firstRender, setFirstRender] = useState(true);

          const derived = { ...props };

          for (let i = 0; i < portalCount; i++) {
            const index = portals[i]!;
            derived[index] = renderReactScope(
              derived[index] as JSX.Element,
              false,
              current,
              i,
              `${id}:${index}`,
            );
          }
          const targets: ReactPortal[] = [];

          useLayoutEffect(() => {
            // showing targets for the first render causes hydration error!
            setFirstRender(false);
          }, []);
          for (let i = 0, len = current.length; i < len; i++) {
            targets[i] = current[i]!.portal;
          }

          return createElement(
            Fragment,
            {},
            createElement(RenderBlock, derived),
            !firstRender ? targets : undefined,
          );
        }
      : (props: MillionProps) => createElement(RenderBlock, props);

  // TODO dev mode
  if (options.name) {
    Component.displayName = `Million(CompiledBlock(Outer(${options.name})))`;
  }

  return Component;
}
