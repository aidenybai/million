// Must be in an input folder for mkdist to build
import { createElement, useEffect, useState } from 'react';
import type { ComponentProps, FunctionComponent } from 'react';

let millionModule: any = null;

export const block = (Component: FunctionComponent) => {
  let blockFactory;
  function MillionBlockLoader(props: ComponentProps<any>) {
    useEffect(() => {
      const importSource = async () => {
        // @ts-expect-error - is defined
        const mod = await import('million/react');
        blockFactory = mod.block(Component);
        (window as any).__MILLION_REGISTRY__.set(Component, blockFactory);
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
  const [mod, setMod] = useState<any>(millionModule);

  useEffect(() => {
    const importSource = async () => {
      // @ts-expect-error - is defined
      millionModule = await import('million/react');
      setMod(millionModule);
    };
    try {
      void importSource();
    } catch (e) {
      throw new Error('Failed to load Million library');
    }
  }, []);

  if (mod) {
    return createElement(mod.For, props);
  }
  return createElement(
    'million-fragment',
    null,
    // ...props.each.map(props.children),
  );
}
