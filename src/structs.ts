/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';

// Props can contain a standard value or a callback function (for events)
export type VProps = Record<string, string | boolean | EventListener>;
export type VNode = VElement | string;
export type VDeltaOperation = [VDeltaOperationTypes, number];
export type VDelta = VDeltaOperation[];
export type VTask = () => void;

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: VFlags;
  delta?: VDelta;
}

export enum VFlags {
  NO_CHILDREN = 0,
  ONLY_TEXT_CHILDREN = 1,
  ANY_CHILDREN = 2,
  ONLY_KEYED_CHILDREN = 3,
}

export const enum VDeltaOperationTypes {
  INSERT = 0,
  UPDATE = 1,
  DELETE = 2,
}
