import {
  Fragment,
  createElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  ComponentType,
  PropsWithChildren,
  ReactNode,
} from 'react';
import parse from 'html-react-parser';
import {
  useContainer,
  useNearestParent,
} from '../react/its-fine';
import type { MillionArrayProps, MillionProps, Options } from '../types';
import { useSSRSafeId } from './utils';

export { renderReactScope } from '../react/utils';

let globalInfo;

const isClient = typeof window !== 'undefined'
const isServer = !isClient

if (isClient) {
  importSource(() => { });
}
export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  options: Options = {},
) => {
  let blockFactory = globalInfo ? globalInfo.block(Component, options) : null;

  const rscBoundary = options.rsc ? createRSCBoundary(Component as any) : null;

  function MillionBlockLoader<P extends MillionProps>(props?: P) {
    const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>();

    const patch = useRef<((props: P) => void) | null>(null);
    const effect = useCallback(() => {
      const init = (): void => {
        const el = parentRef.current ?? container.current;

        if (!el) return;

        const currentBlock = blockFactory(props, props?.key);

        globalInfo.mount(currentBlock, el, el.firstChild);
        patch.current = (newProps: P) => {
          globalInfo.patch(
            currentBlock,
            blockFactory(newProps, newProps.key),
          );
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
            options.svg,
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
        ? createElement(rscBoundary, { ...props } as any)
        : createElement(SSRBoundary, { Component, props } as any),
    );
    return vnode;
  }

  return MillionBlockLoader;
};

export function For<T>({ each, children, ssr }: MillionArrayProps<T>) {
  const isFirstRender = useRef(true)
  const [mounted, setMounted] = useState(false)
  const id = useSSRSafeId();
  const [ready, setReady] = useState(Boolean(globalInfo));

  useEffect(() => {
    isFirstRender.current = false
    if (!globalInfo) {
      importSource(() => {
        setReady(true);
      });
    }
  }, []);

  if (!ready || !globalInfo) {
    if (ssr === false) return null;
    return createElement(
      Fragment,
      null,
      createHydrationBoundary(id, 'start', isServer),
      createElement(Suspend, {
        children: each.map(children),
        id,
      }),
      createHydrationBoundary(id, 'end', isServer),
    );
  }
  const ForElement = createElement(globalInfo.mountContext.Provider, { value: setMounted }, createElement(globalInfo.For, {
    each,
    children,
    ssr,
  }))

  return createElement(
    Fragment,
    null,
    !mounted ? createElement(Suspend, {
      id,
    }) : null,
    ForElement)
}

const Effect = function Effect({ effect }: { effect: () => void }) {
  useEffect(effect, []);
  return null;
};

export function importSource(callback: () => void) {
  void import('../react')
    .then(({ unwrap, INTERNALS, For, }) => {
      globalInfo = {
        unwrap,
        For,
        ...INTERNALS,
      };

      callback();
    })
    .catch((e) => {
      throw new Error(`Failed to load Million.js: ${e}\n${e.stack}`);
    });
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

const thrown = new Map();

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

export const createRSCBoundary = (Component: ComponentType<MillionProps>) => {
  return memo(
    (props) =>
      createElement(SSRBoundary, {
        Component,
        props,
      }),
    () => true,
  );
};
