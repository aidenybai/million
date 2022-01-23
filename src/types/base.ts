/**
 * Field on parent DOM node that stores the root DOM node reference
 */
export const DOM_REF_FIELD = '__m_dom_ref';
/**
 * Field on DOM node that stores the previous VNode
 */
export const OLD_VNODE_FIELD = '__m_old_vnode';
/**
 * Field on DOM node that deleted keyed object pool
 */
export const NODE_OBJECT_POOL_FIELD = '__m_node_object_pool';

export const XLINK_NS = 'http://www.w3.org/1999/xlink';
export const XML_NS = 'http://www.w3.org/XML/1998/namespace';
export const COLON_CHAR = 58;
export const X_CHAR = 120;

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
