import { m, VFlags, className, style, svg } from './dist/million.esm';

const h = (tag, props, children, delta) => {
  let type = VFlags.ANY_CHILDREN;
  if (!children) type = VFlags.NO_CHILDREN;
  if (children && children.some((child) => typeof child === 'string')) {
    type = VFlags.ONLY_TEXT_CHILDREN;
  }
  if (props) {
    if (props.className && typeof props.className === 'object') {
      props.className = className(props.className);
    }
    if (props.style && typeof props.style === 'object') {
      props.style = style(props.style);
    }
  }

  const vnode = m(tag, props, children, type, delta);
  return !props?.ns && tag === 'svg' ? svg(vnode) : vnode;
};

const normalize = (children, normalizedChildren) => {
  for (const child of children) {
    if (child !== undefined && child !== null && child !== false && child !== '') {
      if (Array.isArray(child)) {
        normalize(child, normalizedChildren);
      } else if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        normalizedChildren.push(String(child));
      } else {
        normalizedChildren.push(child);
      }
    }
  }
  return normalizedChildren;
};

const jsx = (tag, props, ...children) => {
  const normalizedChildren = normalize(children, []);
  let delta;
  if (props.delta && props.delta.length > 0) {
    delta = props.delta;
    delete props.delta;
  }
  if (typeof tag === 'function') {
    return tag(props || {}, normalizedChildren, delta);
  } else {
    return h(tag, props || {}, normalizedChildren, delta);
  }
};

const Fragment = (props) => props.children;

export { jsx, jsx as jsxs, Fragment };
