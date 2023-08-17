import {
  version,
  Fragment,
  useRef,
  useCallback,
  useMemo,
  createElement,
  useEffect,
  memo,
} from 'react';
import {
  d as document$,
  b as block$1,
  e as mount$,
  p as patch,
  g as remove$,
  h as arrayPatch$,
  a as mapArray,
  i as arrayMount$,
} from './chunks/block.mjs';
import {
  M as Map$,
  i as MapHas$,
  j as MapGet$,
  h as MapSet$,
} from './chunks/constants.mjs';

const REACT_ROOT = '__react_root';
const RENDER_SCOPE = 'million-render-scope';
const renderReactScope = (jsx) => {
  return (el) => {
    const parent = el ?? document$.createElement(RENDER_SCOPE);

    let root;
    if (version.startsWith('18')) {
      import('react-dom/client')
        .then((res) => {
          root =
            REACT_ROOT in parent
              ? parent[REACT_ROOT]
              : (parent[REACT_ROOT] = res.createRoot(parent));
          root.render(jsx);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    } else {
      root = parent[REACT_ROOT];
      root.render(jsx);
    }
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
    rawChildren.type === Fragment
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
const REGISTRY = new Map$();
const block = (fn, options = {}) => {
  const block2 = MapHas$.call(REGISTRY, fn)
    ? MapGet$.call(REGISTRY, fn)
    : block$1(fn, unwrap);
  function MillionBlock(props) {
    const ref = useRef(null);
    const patch$1 = useRef(null);
    patch$1.current?.(props);
    const effect = useCallback(() => {
      const currentBlock = block2(props, props.key, options.shouldUpdate);
      if (ref.current) {
        mount$.call(currentBlock, ref.current, null);
        patch$1.current = (props2) => {
          patch(currentBlock, block2(props2));
        };
      }
      return () => {
        remove$.call(currentBlock);
      };
    }, []);
    const marker = useMemo(() => {
      return createElement(RENDER_SCOPE, { ref });
    }, []);
    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );
    return vnode;
  }
  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block2);
  }
  return MillionBlock;
};
const Effect = ({ effect }) => {
  useEffect(effect, []);
  return null;
};

const MillionArray = ({ each, children }) => {
  const ref = useRef(null);
  const fragmentRef = useRef(null);
  const cache = useRef({
    each: null,
    children: null,
  });
  if (fragmentRef.current && each !== cache.current.each) {
    const newChildren = createChildren(each, children, cache);
    arrayPatch$.call(fragmentRef.current, mapArray(newChildren));
  }
  useEffect(() => {
    if (fragmentRef.current) return;
    const newChildren = createChildren(each, children, cache);
    fragmentRef.current = mapArray(newChildren);
    arrayMount$.call(fragmentRef.current, ref.current);
  }, []);
  return createElement(RENDER_SCOPE, { ref });
};
const For = memo(MillionArray, (oldProps, newProps) =>
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
    if (MapHas$.call(REGISTRY, vnode.type)) {
      if (!cache.current.block) {
        cache.current.block = MapGet$.call(REGISTRY, vnode.type);
      }
      children[i] = cache.current.block(vnode.props);
    } else {
      const block = block$1((props) => {
        return {
          type: RENDER_SCOPE,
          props: { children: [props?.__scope] },
        };
      });
      const currentBlock = (props) => {
        return block({
          props,
          __scope: renderReactScope(createElement(vnode.type, props)),
        });
      };
      MapSet$.call(REGISTRY, vnode.type, currentBlock);
      cache.current.block = currentBlock;
      children[i] = currentBlock(vnode.props);
    }
  }
  cache.current.each = each;
  cache.current.children = children;
  return children;
};

export { For, REGISTRY, block, renderReactScope, unwrap };
