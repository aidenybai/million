export type Props = Record<string, string | (() => void)>;
export type VNodeChildren = (VNode | string)[];
export type Hooks = Record<string, () => void>;

export interface VNode {
  tag: string;
  props?: Props;
  children?: VNodeChildren;
  hooks?: Hooks;
  skip?: boolean;
  skipChildren?: boolean;
}

const ns = (tag: string, props: Props = {}, children?: VNodeChildren): void => {
  props.ns = 'http://www.w3.org/2000/svg';
  if (children && tag !== 'foreignObject') {
    children.forEach((child: VNode | string) => {
      if (typeof child === 'string') return;
      if (child.props) ns(child.tag, child.props, child.children);
    });
  }
};

/**
 * Generates a style string based on a styleObject
 * @param {Object} styleObject - Object with styles
 * @returns
 */
export const style = (styleObject: Record<string, string>): string => {
  return Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');
};

/**
 * Generates a className string based on a classObject
 * @param {Object} classObject - Object with classes paired with boolean values to toggle
 * @returns {string}
 */
export const className = (classObject: Record<string, boolean>): string => {
  return Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');
};

/**
 * Helper method for creating a Virtual Node
 * @param {string} tag - The tagName of an HTMLElement
 * @param {Props} props - DOM properties and attributes of an HTMLElement
 * @param {VNodeChildren} children - Children of an HTMLElement
 * @param {boolean} skip - Flag to skip diffing of the tag and props of an HTMLElement
 * @param {boolean} skipChildren - Flag to skip the children of the HTMLElement
 * @returns {VNode}
 */
export const m = (
  tag: string,
  props?: Props,
  children?: VNodeChildren,
  hooks?: Hooks,
  skip?: boolean,
  skipChildren?: boolean,
): VNode => {
  if (tag === 'svg') ns(tag, props, children);
  return {
    tag,
    props,
    children,
    hooks,
    skip,
    skipChildren,
  };
};
