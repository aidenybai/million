import { createElement, useEffect, useReducer } from 'react';
import type { ComponentProps, FunctionComponent } from 'react';

// @ts-expect-error - is defined
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let millionModule: typeof import('million/react') | null = null;

export const block = (Component: FunctionComponent) => {
  let blockFactory: any;
  function MillionBlockLoader(props: ComponentProps<any>) {
    useEffect(() => {
      const importSource = async () => {
        // @ts-expect-error - is defined
        millionModule = await import('million/react');
        if (!blockFactory) {
          blockFactory = millionModule.block(Component);
        }
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
      return createElement(
        'million-block',
        null,
        createElement(Component, props),
      );
    }

    return createElement(blockFactory, props);
  }

  return MillionBlockLoader;
};

export function For(props: {
  each: any[];
  children: (item: any, index: number) => any;
}) {
  const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const importSource = async () => {
      // @ts-expect-error - is defined
      millionModule = await import('million/react');
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
  return createElement(
    'million-fragment',
    null,
    ...props.each.map(props.children),
  );
}
