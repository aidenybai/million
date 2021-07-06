import { VElement, VFlags, VNode, VProps } from './structs';

/**
 * Attaches ns props to svg element
 * @param {VElement} vnode - SVG VNode
 * @returns {VElement}
 */
export const svg = (vnode: VElement): VElement => {
  /* istanbul ignore next */
  if (!vnode.props) vnode.props = {};
  ns(vnode.tag, vnode.props, vnode.children);
  return vnode;
};

export const ns = (tag: string, props: VProps, children?: VNode[]): void => {
  props.ns = 'http://www.w3.org/2000/svg';
  if (children && tag !== 'foreignObject') {
    for (const child of children) {
      if (typeof child !== 'string' && child.props) ns(child.tag, child.props, child.children);
    }
  }
};

/**
 * Generates a className string based on a classObject
 * @param {object} classObject - Object with classes paired with boolean values to toggle
 * @returns {string}
 */
export const className = (classObject: Record<string, boolean>): string =>
  Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');

/**
 * Generates a style string based on a styleObject
 * @param {object} styleObject - Object with styles
 * @returns
 */
export const style = (styleObject: Record<string, string>): string =>
  Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');

/**
 * Helper method for creating a VNode
 * @param {string} tag - The tagName of an HTMLElement
 * @param {VProps=} props - DOM properties and attributes of an HTMLElement
 * @param {VNode[]=} children - Children of an HTMLElement
 * @param {VFlags=} flag - Compiler flag for VNode
 * @returns {VElement}
 */
export const m = (tag: string, props?: VProps, children?: VNode[], flag?: VFlags): VElement => {
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
  };
};
