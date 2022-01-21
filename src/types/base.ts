/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';
/**
 * Field on DOM node that deleted keyed object pool
 */
export const NODE_OBJECT_POOL_FIELD = '__m_node_object_pool';

export type VProps = Record<string, string | boolean | EventListener>;
export type DOMNode = HTMLElement | SVGElement | Text | Comment;
export type VNode = VElement | string;
export type DeltaOperation = [DeltaTypes, number];
export type DOMOperation = () => void;
export type Commit = (work: () => void, data: ReturnType<Driver>) => void;
export type Driver = (
  el: DOMNode,
  newVNode?: VNode,
  oldVNode?: VNode,
  effects?: DOMOperation[],
  commit?: Commit,
  driver?: Driver,
) => {
  el: DOMNode;
  newVNode?: VNode;
  oldVNode?: VNode;
  effects?: DOMOperation[];
  commit?: Commit;
  driver?: Driver;
};

export interface VEntity {
  el?: DOMNode;
  ignore?: boolean;
  data: Record<string, unknown>;
  resolve: () => VNode;
}

export interface VElement {
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  flag?: Flags;
  delta?: DeltaOperation[];
}

export enum Flags {
  IGNORE_NODE,
  REPLACE_NODE,
  NO_CHILDREN,
  ONLY_TEXT_CHILDREN,
  ONLY_KEYED_CHILDREN,
  ANY_CHILDREN,
}

export const enum DeltaTypes {
  INSERT,
  UPDATE,
  DELETE,
}
