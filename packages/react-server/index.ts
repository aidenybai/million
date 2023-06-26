import { createElement, useEffect, useReducer } from 'react';
import { RENDER_SCOPE } from '../react/constants';
import type { ComponentType } from 'react';
import type { MillionArrayProps, MillionProps } from '../types';

export { renderReactScope } from '../react/utils';

let millionModule;

export const block = <P extends MillionProps>(Component: ComponentType<P>) => {
  let blockFactory;
  function MillionBlockLoader<P extends MillionProps>(props: P) {
    const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

    useEffect(() => {
      const importSource = async () => {
        millionModule = await import('../react');
        if (!blockFactory) {
          blockFactory = millionModule.block(Component);
        }
        forceUpdate();
      };
      try {
        void importSource();
      } catch (e) {
        throw new Error('Failed to load Million library');
      }

      return () => {
        blockFactory = null;
      };
    }, []);

    if (!blockFactory) {
      return createElement(RENDER_SCOPE, null);
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
