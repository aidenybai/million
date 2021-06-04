export type Props = Record<string, string | (() => void)>;
export type VNodeChildren = (VNode | string)[];

export interface VNode {
  tag: string;
  props?: Props;
  children?: VNodeChildren;
}

export const style = (styleObject: Record<string, string>): string => {
  return Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');
};

export const className = (classObject: Record<string, boolean>): string => {
  return Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');
};

export const m = (tag: string, props?: Props, children?: VNodeChildren): VNode => ({
  tag,
  props,
  children,
});
