'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const react = require('react');
const block$1 = require('./chunks/block.cjs');
const constants = require('./chunks/constants.cjs');

const REACT_ROOT = '__react_root';
const RENDER_SCOPE = 'million-render-scope';
const renderReactScope = (jsx) => {
  return (el) => {
    let root;
    const parent = el ?? block$1.document$.createElement(RENDER_SCOPE);
    if (react.version.startsWith('18')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createRoot } = require('react-dom/client');
      root =
        REACT_ROOT in parent
          ? parent[REACT_ROOT]
          : (parent[REACT_ROOT] = createRoot(parent));
    } else {
      root = parent[REACT_ROOT];
    }
    root.render(jsx);
    return parent;
  };
};
const unwrap = (vnode) => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number' || vnode === true) {
      return String(vnode);
    } else if (!vnode) {
      return void 0;
    }
    return vnode;
  }
  const type = vnode.type;
  if (typeof type === 'function') {
    return unwrap(type(vnode.props ?? {}));
  }
  if (typeof type === 'object' && '$' in type) return type;
  const props = { ...vnode.props };
  const children = vnode.props?.children;
  if (children !== void 0 && children !== null) {
    props.children = flatten(vnode.props.children).map((child) =>
      unwrap(child),
    );
  }
  return {
    type,
    props,
  };
};
const flatten = (rawChildren) => {
  if (rawChildren === void 0 || rawChildren === null) return [];
  if (
    typeof rawChildren === 'object' &&
    'type' in rawChildren &&
    rawChildren.type === react.Fragment
  ) {
    return flatten(rawChildren.props.children);
  }
  if (
    !Array.isArray(rawChildren) ||
    (typeof rawChildren === 'object' && '$' in rawChildren)
  ) {
    return [rawChildren];
  }
  const flattenedChildren = rawChildren.flat(Infinity);
  const children = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten(flattenedChildren[i]));
  }
  return children;
};

const css = `${RENDER_SCOPE} { display: contents }`;
if (CSSStyleSheet.prototype.replaceSync) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [sheet];
} else {
  const style = document.createElement('style');
  document.head.appendChild(style);
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
}
const REGISTRY = new constants.Map$();
const block = (fn, options = {}) => {
  const block2 = constants.MapHas$.call(REGISTRY, fn)
    ? constants.MapGet$.call(REGISTRY, fn)
    : block$1.block(fn, unwrap);
  function MillionBlock(props) {
    const ref = react.useRef(null);
    const patch = react.useRef(null);
    patch.current?.(props);
    const effect = react.useCallback(() => {
      const currentBlock = block2(props, props.key, options.shouldUpdate);
      if (ref.current) {
        block$1.mount$.call(currentBlock, ref.current, null);
        patch.current = (props2) => {
          block$1.patch(currentBlock, block2(props2));
        };
      }
      return () => {
        block$1.remove$.call(currentBlock);
      };
    }, []);
    const marker = react.useMemo(() => {
      return react.createElement(RENDER_SCOPE, { ref });
    }, []);
    const vnode = react.createElement(
      react.Fragment,
      null,
      marker,
      react.createElement(Effect, { effect }),
    );
    return vnode;
  }
  if (!constants.MapHas$.call(REGISTRY, MillionBlock)) {
    constants.MapSet$.call(REGISTRY, MillionBlock, block2);
  }
  return MillionBlock;
};
const Effect = ({ effect }) => {
  react.useEffect(effect, []);
  return null;
};

const MillionArray = ({ each, children }) => {
  const ref = react.useRef(null);
  const fragmentRef = react.useRef(null);
  const cache = react.useRef({
    each: null,
    children: null,
  });
  if (fragmentRef.current && each !== cache.current.each) {
    const newChildren = createChildren(each, children, cache);
    block$1.arrayPatch$.call(
      fragmentRef.current,
      block$1.mapArray(newChildren),
    );
  }
  react.useEffect(() => {
    if (fragmentRef.current) return;
    const newChildren = createChildren(each, children, cache);
    fragmentRef.current = block$1.mapArray(newChildren);
    block$1.arrayMount$.call(fragmentRef.current, ref.current);
  }, []);
  return react.createElement(RENDER_SCOPE, { ref });
};
const For = react.memo(MillionArray, (oldProps, newProps) =>
  Object.is(newProps.each, oldProps.each),
);
const createChildren = (each, getComponent, cache) => {
  const children = Array(each.length);
  for (let i = 0, l = each.length; i < l; ++i) {
    if (cache.current.each && cache.current.each[i] === each[i]) {
      children[i] = cache.current.children?.[i];
      continue;
    }
    const vnode = getComponent(each[i], i);
    if (constants.MapHas$.call(REGISTRY, vnode.type)) {
      if (!cache.current.block) {
        cache.current.block = constants.MapGet$.call(REGISTRY, vnode.type);
      }
      children[i] = cache.current.block(vnode.props);
    } else {
      const block = block$1.block((props) => {
        return {
          type: RENDER_SCOPE,
          props: { children: [props?.__scope] },
        };
      });
      const currentBlock = (props) => {
        return block({
          props,
          __scope: renderReactScope(react.createElement(vnode.type, props)),
        });
      };
      constants.MapSet$.call(REGISTRY, vnode.type, currentBlock);
      cache.current.block = currentBlock;
      children[i] = currentBlock(vnode.props);
    }
  }
  cache.current.each = each;
  cache.current.children = children;
  return children;
};

exports.For = For;
exports.REGISTRY = REGISTRY;
exports.block = block;
exports.renderReactScope = renderReactScope;
exports.unwrap = unwrap;
