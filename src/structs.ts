export type VProps = Record<string, string | unknown | (() => void)>;
export type VNode = VElement | string;

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: VFlags;
  action?: [VActions, number]; // [Action, Number of nodes]
}

export enum VFlags {
  NO_CHILDREN = 0,
  ONLY_TEXT_CHILDREN = 1,
  ANY_CHILDREN = 2,
}

export enum VActions {
  INSERT_TOP = 0,
  INSERT_BOTTOM = 1,
  DELETE_TOP = 2,
  DELETE_BOTTOM = 3,
  ANY_ACTION = 4,
}
