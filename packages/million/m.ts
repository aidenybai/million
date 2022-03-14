import { Delta, DeltaTypes, DOMNode, Flags, VElement, VEntity, VNode, VProps } from './types';

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
    delete props.className;
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

/**
 * INSERT, UPDATE, or DELETE Deltas
 */
export const Deltas = {
  INSERT: (positionIdx = 0): Delta => [DeltaTypes.INSERT, positionIdx],
  UPDATE: (positionIdx = 0): Delta => [DeltaTypes.UPDATE, positionIdx],
  DELETE: (positionIdx = 0): Delta => [DeltaTypes.DELETE, positionIdx],
};

/**
 * Helper function for constructing entities
 */
export const entity = (
  data: Record<string, unknown>,
  resolve: () => VNode,
  el?: DOMNode,
): VEntity => {
  let key = undefined;
  if (data.key) {
    key = <string | undefined>data.key;
    delete data.key;
  }
  return {
    data,
    resolve,
    el,
    key,
  };
};

/**
 * Helper method for creating a VNode
 */
export const m = (
  tag: string,
  props?: VProps,
  children?: VNode[],
  flag?: Flags,
  delta?: Delta[],
): VElement => {
  let key = undefined;
  if (props?.key) {
    key = <string | undefined>props.key;
    delete props.key;
  }
  const vnode = {
    tag,
    props,
    children,
    key,
    flag,
    delta,
  };
  return vnode.tag?.toLowerCase() === 'svg' ? svg(vnode) : vnode;
};
