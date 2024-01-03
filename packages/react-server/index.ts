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
import {
  useContainer,
  useFiber,
  useNearestParent,
  useNearestParentFiber,
} from '../react/its-fine';
import type { ComponentType, ForwardedRef } from 'react';
import { RENDER_SCOPE, SVG_RENDER_SCOPE } from '../react/constants';
import type { MillionArrayProps, MillionProps, Options } from '../types';
import { renderReactScope } from '../react/utils';

export { renderReactScope } from '../react/utils';

let globalInfo;
// if (!window._nextSetupHydrationWarning) {
//     const origConsoleError = window.console.error;
//     window.console.error = (...args)=>{
//         const isHydrateError = args.some((arg)=>typeof arg === 'string' && arg.match(/(hydration|content does not match|did not match)/i));
//         if (isHydrateError) {
//             args = [
//                 ...args,
//                 `\n\nSee more info here: https://nextjs.org/docs/messages/react-hydration-error`, 
//             ];
//         }
//         origConsoleError.apply(window.console, args);
//     };
//     window._nextSetupHydrationWarning = true;
// }

const NativeError = Error
// @ts-ignore
globalThis.Error = class extends NativeError {
  constructor(...args) {
    super()
    if (args[0] ==="Hydration failed because the initial UI does not match what was rendered on the server.") {
      return {} as any
    }
    if (args[0]?.includes('There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.')) {
      return {} as any
    }
    return new NativeError(...args)
  }
  
}

function patchErrors() {
  const { warn, error } = console
  console.log('here')
  const base = (method: Function) => (...args: unknown[]) => {
    console.log(args)
    if (typeof args[0] !== 'string') 
      return
    if (args[0].includes('Did not expect server HTML to contain a <%s> in <%s>.%s')) {
      return
    }
    if (args[0].includes('An error occurred during hydration. The server HTML was replaced with client content in <%s>.')) {
      return
    }
    return method(...args)
  } 
  console.error = base(error)
  console.warn = base(warn)
  return () => {
    // console.error = error
    // console.warn = warn
  }
}
patchErrors()


export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  options: Options = {},
) => {
  let blockFactory = globalInfo ? globalInfo.block(Component, options) : null;

  const rscBoundary = options.rsc ? createRSCBoundary(Component) : null;

  function MillionBlockLoader<P extends MillionProps>(props?: P) {
    const fiber = useFiber();
    const parentFiber = useNearestParentFiber();
    console.log(parentFiber);
    const container = useContainer<HTMLElement>(); // usable when there's no parent other than the root element
    const parentRef = useNearestParent<HTMLElement>();

    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    const unpatch = patchErrors()

    const effect = useCallback(() => {
      const init = (): void => {
        if (parentFiber) {
          parentFiber.pendingProps = {
            ...parentFiber.pendingProps,
            suppressHydrationWarning: true,
            // dangerouslySetInnerHTML: { __html: '' }
          };
          parentFiber.memoizedProps = {
            ...parentFiber.memoizedProps,
            suppressHydrationWarning: true,
            // dangerouslySetInnerHTML: { __html: '' }
          };
        }

        const el = parentRef.current ?? container.current;

        if (!el) return;
        // globalInfo.setAttribute(el, 'suppresshydrationwarning', true)

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
            options.svg,
          );

          init();
        });
      }

      return () => {
        // unpatch()
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
        : createSSRBoundary<P>(Component as any, props!),
    );
    return vnode;
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
    .then(({ unwrap, INTERNALS, For }) => {
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
};

export const createSSRBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
  props: P,
) => {
  const ssrProps =
    typeof window === 'undefined'
      ? {
          children: createElement<P>(Component, props),
        }
      : {
          // TODO: patch the warning for a while and then free it up, see the its-fine implmeentation of patching
        };

  const el = createElement(Fragment, {
    // suppressHydrationWarning: true,
    // ref,
    ...ssrProps,
  });
  return el;
};

export const createRSCBoundary = <P extends MillionProps>(
  Component: ComponentType<P>,
) => {
  return memo(
    (props: P) => createSSRBoundary(Component, props),
    () => true,
  );
};
