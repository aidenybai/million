import {
  Delta,
  DeltaTypes,
  DOMNode,
  Flags,
  Hook,
  RawVNode,
  Thunk,
  VElement,
  VElementFlags,
  VNode,
  VProps,
} from './types';

/**
 * Attaches ns props to svg element
 */
export const svg = (vnode: VElement): VElement => {
  /* istanbul ignore next */
  if (!vnode.props) vnode.props = {};
  ns(vnode.tag, vnode.props, vnode.children);
  return vnode;
};

/**
 * Attaches ns props to an arbitrary element
 */
export const ns = (tag: string, props: VProps, children?: VNode[]): void => {
  if (props.className) {
    props.class = props.className;
    props.className = undefined;
  }
  props.ns = 'http://www.w3.org/2000/svg';
  if (children && tag !== 'foreignObject') {
    for (const child of children) {
      if (typeof child !== 'string' && child.props) ns(child.tag, child.props, child.children);
    }
  }
};

/**
 * Generates a className string based on a classObject
 */
export const className = (classObject: Record<string, boolean>): string =>
  Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');

/**
 * Generates a style string based on a styleObject
 */
export const style = (styleObject: Record<string, string>): string =>
  Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');

/**
 * Converts key names from camelCase to kebab-case
 */
export const kebab = (camelCaseObject: Record<string, unknown>): Record<string, unknown> => {
  const kebabCaseObject = {};
  for (const key in camelCaseObject) {
    kebabCaseObject[key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()] =
      camelCaseObject[key];
  }
  return kebabCaseObject;
};

export const Deltas = {
  CREATE: (i = 0): Delta => [DeltaTypes.CREATE, i],
  UPDATE: (i = 0): Delta => [DeltaTypes.UPDATE, i],
  REMOVE: (i = 0): Delta => [DeltaTypes.REMOVE, i],
};

/**
 * Helper method for creating a VNode
 */
export const m = (
  tag: string,
  props?: VProps,
  children?: VNode[],
  flag: VElementFlags = Flags.ELEMENT,
  delta?: Delta[],
  hook: Hook = () => true,
): VElement => {
  let key = undefined;
  if (props?.key) {
    key = props.key as string | undefined;
    delete props.key;
  }
  const velement: VElement = {
    tag,
    props,
    children,
    key,
    flag,
    delta,
    hook,
  };
  return velement.tag.toLowerCase() === 'svg' ? svg(velement) : velement;
};

export const thunk = (fn: (...args: any[]) => VNode, args: any[]): VNode => {
  const vnode = fn(...args) as Thunk;
  if (typeof vnode === 'object') {
    vnode.flag = Flags.ELEMENT_THUNK;
    vnode.args = args;
    vnode.hook = (_el?: DOMNode, newVNode?: VNode, oldVNode?: VNode): boolean => {
      if (
        typeof newVNode === 'object' &&
        typeof oldVNode === 'object' &&
        newVNode.flag === Flags.ELEMENT_THUNK &&
        oldVNode.flag === Flags.ELEMENT_THUNK
      ) {
        if (oldVNode.args.length === newVNode.args.length) {
          let shouldPatch = false;
          for (let i = 0; i < newVNode.args.length; i++) {
            if (oldVNode.args[i] !== newVNode.args[i]) shouldPatch = true;
          }
          return shouldPatch;
        }
      }
      return true;
    };
  }
  return vnode;
};

export const normalize = (rawVNode: RawVNode): VNode | VNode[] | undefined => {
  if (Array.isArray(rawVNode)) {
    const normalizedChildren: VNode[] = [];
    for (let i = 0; i < rawVNode.length; i++) {
      normalizedChildren.push(normalize(rawVNode[i]) as VNode);
    }
    return normalizedChildren;
  } else if (
    typeof rawVNode === 'string' ||
    typeof rawVNode === 'number' ||
    typeof rawVNode === 'boolean'
  ) {
    return String(rawVNode);
  } else {
    return rawVNode as VNode;
  }
};

export const h = (tag: string, props?: VProps, ...children: RawVNode[]) => {
  let flag: VElementFlags = Flags.ELEMENT_NO_CHILDREN;
  let delta: Delta[] | undefined;
  const normalizedChildren: VNode[] = [];
  if (props) {
    const rawDelta = props.delta as Delta[];
    if (rawDelta && rawDelta.length) {
      delta = rawDelta;
      props.delta = undefined;
    }
  }
  if (children) {
    const keysInChildren = new Set();
    let hasVElementChildren = false;
    flag = Flags.ELEMENT;

    if (children.every((child) => typeof child === 'string')) {
      flag = Flags.ELEMENT_TEXT_CHILDREN;
    }
    let childrenLength = 0;
    for (let i = 0; i < children.length; ++i) {
      if (
        children[i] !== undefined &&
        children[i] !== null &&
        children[i] !== false &&
        children[i] !== ''
      ) {
        const unwrappedChild = normalize(children[i]) as VNode;
        const subChildren = Array.isArray(unwrappedChild)
          ? ((childrenLength += unwrappedChild.length), unwrappedChild)
          : (childrenLength++, [unwrappedChild]);

        for (let i = 0; i < subChildren.length; i++) {
          if (subChildren[i] || subChildren[i] === '') {
            normalizedChildren.push(subChildren[i]);
            if (typeof subChildren[i] === 'object') {
              hasVElementChildren = true;
              if (typeof subChildren[i].key === 'string' && subChildren[i].key !== '') {
                keysInChildren.add(subChildren[i].key);
              }
            }
          }
        }
      }
    }
    if (keysInChildren.size === childrenLength) {
      flag = Flags.ELEMENT_KEYED_CHILDREN;
    }
    if (!hasVElementChildren) {
      flag = Flags.ELEMENT_TEXT_CHILDREN;
    }
  }
  if (props) {
    if (typeof props.flag === 'number') {
      flag = props.flag;
      props.flag = undefined;
    }
    if (typeof props.className === 'object') {
      props.className = className(props.className as Record<string, boolean>);
    }
    if (typeof props.style === 'object') {
      const rawStyle = props.style as Record<string, string>;
      const normalizedStyle = Object.keys(rawStyle).some((key) => /[-A-Z]/gim.test(key))
        ? kebab(rawStyle)
        : rawStyle;
      props.style = style(normalizedStyle as Record<string, string>);
    }
  }

  const vnode = m(tag, props, normalizedChildren, flag, delta);
  return tag === 'svg' ? svg(vnode) : vnode;
};
