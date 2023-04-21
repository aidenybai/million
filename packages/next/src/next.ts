// Must be in an input folder for mkdist to build
import { createElement, useEffect, useReducer } from 'react';
import type { ComponentProps, FunctionComponent } from 'react';

let millionModule: any = null;

export const block = (Component: FunctionComponent) => {
  let blockFactory: any;
  function MillionBlockLoader(props: ComponentProps<any>) {
    useEffect(() => {
      const importSource = async () => {
        // @ts-expect-error - is defined
        millionModule = await import('million/react');
        blockFactory = millionModule.block(Component);
      };
      try {
        void importSource();
      } catch (e) {
        throw new Error('Failed to load Million library');
      }
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
    // ...props.each.map(props.children),
  );
}
