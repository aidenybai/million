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
) => {
  el: DOMNode;
  newVNode: VNode;
  oldVNode?: VNode;
  workStack?: VTask[];
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
  NO_CHILDREN = 0,
  ONLY_TEXT_CHILDREN = 1,
  ONLY_KEYED_CHILDREN = 2,
  ANY_CHILDREN = 3,
}

export const enum VDeltaOperationTypes {
  INSERT = 0,
  UPDATE = 1,
  DELETE = 2,
}
