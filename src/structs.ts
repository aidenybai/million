/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';

export type VProps = Record<string, string | unknown | (() => void)>;
export type VNode = VElement | string;
export type VDeltaOperation = [VDeltaOperationTypes, number];
export type VDelta = VDeltaOperation[];

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: VFlags;
  delta?: VDelta;
}

export enum VFlags {
  NO_CHILDREN = 1 << 0,
  ONLY_TEXT_CHILDREN = 1 << 1,
  ANY_CHILDREN = 1 << 2,
}

export const enum VDeltaOperationTypes {
  INSERT = 1 << 0,
  UPDATE = 1 << 1,
  DELETE = 1 << 2,
}
