import type { ComponentType, ForwardedRef, JSX, ReactNode, ReactPortal } from 'react';
import {
  Fragment,
  createElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { RENDER_SCOPE, SVG_RENDER_SCOPE } from '../react/constants';
import type { MillionArrayProps, MillionPortal, MillionProps, Options } from '../types';
import { renderReactScope } from '../react/utils';
import { useSSRSafeId } from './utils';
// import { renderReactScope } from '../react';

let globalInfo;

const isClient = typeof window !== 'undefined'
const isServer = !isClient

export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  options: Options<P> = {}
): ComponentType<P> => {
  let blockFactory = globalInfo ? globalInfo.block(Component, options) : null;

  const rscBoundary = options.rsc
    ? createRSCBoundary(Component, options.svg)
    : null;

  function MillionBlockLoader(props?: P) {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    const effect = useCallback(() => {
      const init = (): void => {
        const el = ref.current;

        if (!el) return;
        globalInfo.removeComments(el)

        const currentBlock = blockFactory(props, props?.key);

        globalInfo.mount(currentBlock, el, el.firstChild);
        patch.current = (newProps: P) => {
          globalInfo.patch(currentBlock, blockFactory(newProps, newProps.key));
        };
      };

      if (blockFactory && globalInfo) {
        init();
      } else {
        importSource(() => {
          blockFactory = globalInfo.block(
            Component,
            globalInfo.unwrap,
            options.shouldUpdate,
            options.svg
          );

          init();
        });
      }

      return () => {
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
        : createSSRBoundary<P>(Component as any, props!, ref, options.svg)
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
      ...each.map(children)
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
    .catch(() => {
      throw new Error('Failed to load Million.js');
    });
};
const thrown = new Map<string, string>();

export const createSSRBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
  props: P,
  ref: ForwardedRef<unknown>,
  svg = false
) => {
  const id = useSSRSafeId();
  // if (isClient) {
  //   console.log(id)
  //   console.log(document.getElementById(id))
  //   console.log(document.getElementById(id)?.innerHTML)
  // }

  // debugger
  // if (isClient && !thrown.has(id)) {
  //   const html = document.getElementById(id)?.innerHTML!
  //   thrown.set(id, html)
  //   throw Promise.resolve()
  // }

  const ssrProps =
    typeof window === 'undefined'
      ? {
          children: createElement<P>(Component, props),
        }
      : { dangerouslySetInnerHTML: { __html: '' } };

  return createElement(svg ? SVG_RENDER_SCOPE : RENDER_SCOPE, {
    suppressHydrationWarning: true,
    ref,
    id,
    ...ssrProps,
  });
};

export const createRSCBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
  svg = false
) => {
  return memo(
    forwardRef((props: P, ref) =>
      createSSRBoundary(Component, props, ref, svg)
    ),
    () => true
  );
};

const wrap = (vnode: ReactNode): ReactNode => {
  return createElement(RENDER_SCOPE, { suppressHydrationWarning: true }, vnode);
};

// export const renderReactScope = (
//   vnode: ReactNode,
//   _unstable: boolean,
//   _portals: MillionPortal[] | undefined,
//   _currentIndex: number,
// ) => {
//   return wrap(vnode);
// };

function isEqual(a: unknown, b: unknown): boolean {
  // Faster than Object.is
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b);
}

function shouldCompiledBlockUpdate(prev: MillionProps, next: MillionProps): boolean {
  for (const key in prev) {
    if (!isEqual(prev[key], next[key])) {
      return true;
    }
  }
  return false;
}

interface CompiledBlockOptions extends Omit<Options<MillionProps>, 'shouldUpdate'> {
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

  const Component: ComponentType<MillionProps> = portals && portalCount > 0 ? (props: MillionProps) => {
    const [current] = useState<MillionPortal[]>(() => []);

    const derived = {...props};

    for (let i = 0; i < portalCount; i++) {
      const index = portals[i]!;
      // debugger
      // derived[index] = renderReactScope(
      //   derived[index] as JSX.Element,
      //   false,
      //   current,
      //   i,
      // );
    }

    const targets: ReactPortal[] = [];

    for (let i = 0, len = current.length; i < len; i++) {
      targets[i] = current[i]!.portal;
    }

    return createElement(Fragment, {},
      createElement(RenderBlock, derived),
      targets,
    );
  } : (props: MillionProps) => createElement(RenderBlock, props);

  // TODO dev mode
  if (options.name) {
    Component.displayName = `Million(CompiledBlock(Outer(${options.name})))`;
  }

  return Component;
}


export const SSRBoundary = <P extends MillionProps>(
  {
    Component,
    props,
  }: {
    Component: ComponentType<P>;
    props: P;
  },
) => {
  const children =
    isServer ? createElement<P>(Component, props) : null;
  const id = useSSRSafeId();

  const el = createElement(
    Fragment,
    null,
    createHydrationBoundary(id, 'start', isServer),
    createElement(Suspend, {
      children,
      id,
    }),
    createHydrationBoundary(id, 'end', isServer),
  );
  return el;
};

// const thrown = new Map();

function Suspend({
  children,
  id,
}: PropsWithChildren<{ id: string }>): ReactNode {
  if (isServer) {
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
    throw Promise.resolve();
  }
  // we can return null to avoid parsing but this would cause a flashing
  return thrown.get(id);
}

const createHydrationBoundary = (id: string, phase: 'start' | 'end', isSSR: boolean) => {
  // TODO: Better to use html commnts which are not allowed in React
  return isSSR ? createElement('template', { id: `${phase}-${id}` }) : null;
};
