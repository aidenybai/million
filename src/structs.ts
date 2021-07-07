export type VProps = Record<string, string | unknown | (() => void)>;
export type VNode = VElement | string;

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: VFlags;
}

export enum VFlags {
  NO_CHILDREN = 1 << 0,
  ONLY_TEXT_CHILDREN = 1 << 1,
  ANY_CHILDREN = 1 << 2,
}
