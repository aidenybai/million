import {
  Delta,
  DeltaTypes,
  DOMNode,
  Flags,
  Hooks,
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
  hook?: Hooks,
): VElement => {
  let key = undefined;
  let ref = undefined;
  if (props?.key) {
    key = props.key as string | undefined;
    delete props.key;
  }
  if (props?.ref) {
    ref = props.ref as { current: any };
    delete props.ref;
  }
  const velement: VElement = {
    tag,
    props,
    children,
    key,
    flag,
    delta,
    hook,
    ref,
  };
  return velement.tag.toLowerCase() === 'svg' ? svg(velement) : velement;
};

export const thunk = (fn: (...args: any[]) => VNode, args: any[]): VNode => {
  const vnode = fn(...args) as Thunk;
  if (typeof vnode === 'object') {
    vnode.flag = Flags.ELEMENT_THUNK;
    vnode.args = args;
    if (!vnode.hook) vnode.hook = {};
    vnode.hook.diff = (_el?: DOMNode, newVNode?: VNode, oldVNode?: VNode): boolean => {
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
