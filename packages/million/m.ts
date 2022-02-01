import {
  DeltaOperation,
  DeltaTypes,
  DOMNode,
  Flags,
  OLD_VNODE_FIELD,
  VElement,
  VEntity,
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
 * INSERT, UPDATE, or DELETE DeltaOperations
 */
export const Delta = {
  INSERT: (positionIdx = 0): DeltaOperation => [DeltaTypes.INSERT, positionIdx],
  UPDATE: (positionIdx = 0): DeltaOperation => [DeltaTypes.UPDATE, positionIdx],
  DELETE: (positionIdx = 0): DeltaOperation => [DeltaTypes.DELETE, positionIdx],
};

/**
 * Helper function for constructing entities
 */
export const entity = (
  data: Record<string, unknown>,
  resolve: () => VNode,
  el?: DOMNode,
): VEntity => ({
  data,
  resolve,
  el,
});

/**
 * Helper method for creating a VNode
 */
export const m = (
  tag: string,
  props?: VProps,
  children?: VNode[],
  flag?: Flags,
  delta?: DeltaOperation[],
): VElement => {
  let key;
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

/**
 * Turns a DOMNode into a VNode
 */
export const toVNode = (el: DOMNode): VNode | undefined => {
  if (el[OLD_VNODE_FIELD]) return el[OLD_VNODE_FIELD];
  if (el instanceof Text) return String(el.nodeValue);
  if (el instanceof Comment) return undefined;

  const props = {};
  // We know children length, so we created a fixed array
  const children = new Array(el.children.length).fill(0);
  for (let i = 0; i < el.attributes.length; i++) {
    const { nodeName, nodeValue } = el.attributes[i];
    props[nodeName] = nodeValue;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    children[i] = toVNode(<DOMNode>el.childNodes[i]);
  }

  const vnode = m(el.tagName.toLowerCase(), props, children);
  el[OLD_VNODE_FIELD] = vnode;
  return vnode;
};
