export type Props = Record<string, string | (() => void)>;
export type VNodeChildren = (VNode | string)[];

export interface VNode {
  tag: string;
  props?: Props;
  children?: VNodeChildren;
  skip?: boolean;
  skipChildren?: boolean;
}

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
  skip?: boolean,
  skipChildren?: boolean,
): VNode => ({
  tag,
  props,
  children,
  skip,
  skipChildren,
});
