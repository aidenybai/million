'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const utils = require('packages/react/utils');
const react = require('react');

let millionModule = null;
const block = (Component) => {
  let blockFactory;
  function MillionBlockLoader(props) {
    react.useEffect(() => {
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
      return react.createElement(utils.RENDER_SCOPE, null, react.createElement(Component, props));
    }
    return react.createElement(blockFactory, props);
  }
  return MillionBlockLoader;
};
function For(props) {
  const [_, forceUpdate] = react.useReducer((x) => x + 1, 0);
  react.useEffect(() => {
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
    return react.createElement(millionModule.For, props);
  }
  return react.createElement(
    "million-fragment",
    null,
    ...props.each.map(props.children)
  );
}

exports.For = For;
exports.block = block;
