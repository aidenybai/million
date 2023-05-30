import { h } from 'preact';
import { useEffect, useReducer } from 'preact/hooks';
import type { ComponentProps, FunctionComponent } from 'preact';

// @ts-expect-error - is defined
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let millionModule: typeof import('million/preact') | null = null;
const RENDER_SCOPE = 'million-render-scope';

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
      return h(RENDER_SCOPE, null, h(Component, props));
    }

    return h(blockFactory, props);
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
      forceUpdate(0);
    };
    try {
      void importSource();
    } catch (e) {
      throw new Error('Failed to load Million library');
    }
  }, []);

  if (millionModule) {
    return h(millionModule.For, props);
  }
  return h(RENDER_SCOPE, null, ...props.each.map(props.children));
}
