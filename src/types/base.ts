/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';
export type VProps = Record<string, string | boolean | EventListener>;
export type DOMNode = HTMLElement | SVGElement | Text;
export type VNode = VElement | string;
export type VDeltaOperation = [VDeltaOperationTypes, number];
export type VDelta = VDeltaOperation[];
export type VTask = () => void;
export type VCommit = (task: VTask) => void;

export type VDriver = (
  el: DOMNode,
  newVNode: VNode,
  oldVNode?: VNode,
  workStack?: VTask[],
  driver?: VDriver,
) => {
  el: DOMNode;
  newVNode: VNode;
  oldVNode?: VNode;
  workStack?: VTask[];
  driver?: VDriver;
};

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: VFlags;
  delta?: VDelta;
}

export enum VFlags {
  IGNORE_NODE = 0,
  REPLACE_NODE = 1,
  NO_CHILDREN = 2,
  ONLY_TEXT_CHILDREN = 3,
  ONLY_KEYED_CHILDREN = 4,
  ANY_CHILDREN = 5,
}

export const enum VDeltaOperationTypes {
  INSERT = 0,
  UPDATE = 1,
  DELETE = 2,
}
