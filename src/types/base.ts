/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';
/**
 * Field on DOM node that deleted keyed object pool
 */
export const NODE_OBJECT_POOL_FIELD = '__m_node_object_pool';

export type VProps = Record<string, string | boolean | EventListener>;
export type DOMNode = HTMLElement | SVGElement | Text;
export type VNode = VElement | string;
export type VDeltaOperation = [VDeltaOperationTypes, number];
export type VDelta = VDeltaOperation[];
export type VTask = () => void;
export type VCommit = (task: VTask) => void;

export type VDriver = (
  el: DOMNode,
  newVNode?: VNode,
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
  IGNORE_NODE,
  REPLACE_NODE,
  NO_CHILDREN,
  ONLY_TEXT_CHILDREN,
  ONLY_KEYED_CHILDREN,
  ANY_CHILDREN,
}

export const enum VDeltaOperationTypes {
  INSERT,
  UPDATE,
  DELETE,
}
