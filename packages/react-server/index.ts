import { createElement, useEffect, useState } from 'react';
import { RENDER_SCOPE, SVG_RENDER_SCOPE } from '../react/constants';
import type { ComponentType } from 'react';
import type { MillionArrayProps, MillionProps, Options } from '../types';

export { renderReactScope } from '../react/utils';

let millionModule;

export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  options: Options = {},
) => {
  let blockFactory: any = millionModule ? millionModule.block(Component) : null;
  function MillionBlockLoader<P extends MillionProps>(props: P) {
    const [ready, setReady] = useState(Boolean(blockFactory));

    useEffect(() => {
      if (!blockFactory) {
        const importSource = async () => {
          if (!millionModule) millionModule = await import('../react');
          blockFactory = millionModule.block(Component, options);
          setReady(true);
        };
        try {
          void importSource();
        } catch (e) {
          throw new Error('Failed to load Million.js');
        }
      }

      return () => {
        blockFactory = null;
      };
    }, []);

    if (!ready || !blockFactory) {
      if (options.ssr === false) return null;
      return createElement<P>(
        RENDER_SCOPE,
        null,
        // During compilation we will attach a .original for the component and
        // pass __props as the props to the component. This references
        // the original component for SSR.
        createElement(options.original as any, props.__props),
      );
    }

    return createElement<P>(blockFactory, props);
  }

  return MillionBlockLoader<P>;
};

export function For<T>({ each, children, ssr, svg }: MillionArrayProps<T>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (millionModule) return;
    const importSource = async () => {
      millionModule = await import('../react');
      setReady(true);
    };
    try {
      void importSource();
    } catch (e) {
      throw new Error('Failed to load Million.js');
    }
  }, []);

  if (!ready || !millionModule) {
    if (ssr === false) return null;
    return createElement(
      svg ? SVG_RENDER_SCOPE : RENDER_SCOPE,
      null,
      ...each.map(children),
    );
  }

  return createElement(millionModule.For, {
    each,
    children,
    ssr,
    svg,
  });
}
