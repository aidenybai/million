import { h } from 'preact';
import { useEffect, useReducer } from 'preact/hooks';
import { RENDER_SCOPE } from '../react/constants';
import type { ComponentProps, ComponentType } from 'preact';
import { MillionProps } from 'packages/types';

export { renderPreactScope } from '../preact/utils';

let millionModule;

export const block =  <P extends MillionProps>(Component: ComponentType<P>) => {
  let blockFactory;
  function MillionBlockLoader(props: ComponentProps<P>) {
    useEffect(() => {
      const importSource = async () => {
        millionModule = await import('../preact');
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
      millionModule = await import('../preact');
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
