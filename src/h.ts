export type Attributes = Record<string, string>;
export type VNodeChildren = (VNode | string)[];

export interface VNode {
  tag: string;
  attributes?: Attributes;
  children?: VNodeChildren;
}

export const h = (tag: string, attributes: Attributes, children: VNodeChildren): VNode => ({
  tag,
  attributes,
  children,
});
