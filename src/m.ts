export type VProps = Record<string, string | unknown | (() => void)>;
export type VNode = VElement | string;

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
}

/**
 * Attaches ns props to svg element
 * @param {string} tag - Tag of VNode
 * @param {VProps} props - Props of VNode
 * @param {VProps=} children - Children of VNode
 */
export const ns = (tag: string, props: VProps, children?: VNode[]): void => {
  props.ns = 'http://www.w3.org/2000/svg';
  if (children && tag !== 'foreignObject') {
    children.forEach((child: VNode) => {
      if (typeof child === 'string') return;
      if (child.props) ns(child.tag, child.props, child.children);
    });
  }
};

/**
 * Generates a style string based on a styleObject
 * @param {object} styleObject - Object with styles
 * @returns
 */
export const style = (styleObject: Record<string, string>): string => {
  return Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');
};

/**
 * Generates a className string based on a classObject
 * @param {object} classObject - Object with classes paired with boolean values to toggle
 * @returns {string}
 */
export const className = (classObject: Record<string, boolean>): string => {
  return Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');
};

/**
 * Helper method for creating a VNode
 * @param {string} tag - The tagName of an HTMLElement
 * @param {VProps} props - DOM properties and attributes of an HTMLElement
 * @param {VNode[]} children - Children of an HTMLElement
 * @returns {VElement}
 */
export const m = (tag: string, props?: VProps, children?: VNode[]): VElement => {
  let key;
  if (tag === 'svg') {
    if (!props) props = {};
    ns(tag, props, children);
  }
  if (props?.key) {
    key = <string | undefined>props.key;
    delete props.key;
  }
  if (typeof props?.className === 'object') {
    props.className = className(<Record<string, boolean>>props.className);
  }
  if (typeof props?.style === 'object') {
    props.style = style(<Record<string, string>>props.style);
  }
  return {
    tag,
    props,
    children,
    key,
  };
};
