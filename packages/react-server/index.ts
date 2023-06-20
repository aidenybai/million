import { createElement, useEffect, useReducer, useState } from 'react';
import { RENDER_SCOPE } from '../react/constants';
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
          blockFactory = millionModule.block(Component);
          setReady(true);
        };
        try {
          void importSource();
        } catch (e) {
          throw new Error('Failed to load Million library');
        }
      }

      return () => {
        blockFactory = null;
      };
    }, []);

    if (!ready || !blockFactory) {
      const v = createElement<P>(
        RENDER_SCOPE,
        null,
        createElement(options.originalComponent as any, props),
      );
      return v;
    }

    return createElement<P>(blockFactory, props);
  }

  return MillionBlockLoader<P>;
};

export function For<T>(props: MillionArrayProps<T>) {
  const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const importSource = async () => {
      millionModule = await import('../react');
      forceUpdate();
    };
    try {
      void importSource();
    } catch (e) {
      throw new Error('Failed to load Million library');
    }
  }, []);

  if (millionModule) {
    return createElement(millionModule.For, props);
  }
  return createElement(RENDER_SCOPE, null, ...props.each.map(props.children));
}
