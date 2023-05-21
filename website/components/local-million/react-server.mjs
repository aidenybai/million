import { RENDER_SCOPE } from 'packages/react/utils';
import { useReducer, useEffect, createElement } from 'react';

let millionModule = null;
const block = (Component) => {
  let blockFactory;
  function MillionBlockLoader(props) {
    useEffect(() => {
      const importSource = async () => {
        millionModule = await import('million/react');
        if (!blockFactory) {
          blockFactory = millionModule.block(Component);
        }
      };
      try {
        void importSource();
      } catch (e) {
        throw new Error("Failed to load Million library");
      }
      return () => {
        blockFactory = null;
      };
    }, []);
    if (!blockFactory) {
      return createElement(RENDER_SCOPE, null, createElement(Component, props));
    }
    return createElement(blockFactory, props);
  }
  return MillionBlockLoader;
};
function For(props) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const importSource = async () => {
      millionModule = await import('million/react');
      forceUpdate();
    };
    try {
      void importSource();
    } catch (e) {
      throw new Error("Failed to load Million library");
    }
  }, []);
  if (millionModule) {
    return createElement(millionModule.For, props);
  }
  return createElement(
    "million-fragment",
    null,
    ...props.each.map(props.children)
  );
}

export { For, block };
