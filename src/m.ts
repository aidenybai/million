import {
  DOMNode,
  OLD_VNODE_FIELD,
  VDelta,
  VDeltaOperation,
  VDeltaOperationTypes,
  VElement,
  VFlags,
  VNode,
  VProps,
} from './types/base';

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
 * Returns an insert (creation) delta operation
 */
export const INSERT = (positionIdx = 0): VDeltaOperation => [
  VDeltaOperationTypes.INSERT,
  positionIdx,
];

/**
 * Returns an update (modification) delta operation
 */
export const UPDATE = (positionIdx = 0): VDeltaOperation => [
  VDeltaOperationTypes.UPDATE,
  positionIdx,
];

/**
 * Returns an delete (removal) delta operation
 */
export const DELETE = (positionIdx = 0): VDeltaOperation => [
  VDeltaOperationTypes.DELETE,
  positionIdx,
];

/**
 * Helper method for creating a VNode
 */
export const m = (
  tag: string,
  props?: VProps,
  children?: VNode[],
  flag?: VFlags,
  delta?: VDelta,
): VElement => {
  let key;
  if (props?.key) {
    key = <string | undefined>props.key;
    delete props.key;
  }
  return {
    tag,
    props,
    children,
    key,
    flag,
    delta,
  };
};

/**
 * Turns a DOMNode into a VNode
 */
export const toVNode = (el: DOMNode): VNode => {
  if (el[OLD_VNODE_FIELD]) return el[OLD_VNODE_FIELD];
  if (el instanceof Text) return String(el.nodeValue);

  const props = {};
  const children = new Array(el.children.length).fill(0);
  for (let i = 0; i < el.attributes.length; i++) {
    props[el.attributes[i].nodeName] = el.attributes[i].nodeValue;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    children[i] = toVNode(<DOMNode>el.childNodes[i]);
  }

  const vnode = m(el.tagName, props, children);
  el[OLD_VNODE_FIELD] = vnode;
  return vnode;
};
