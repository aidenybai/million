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

export type VProps = Record<string, any>;
export type DOMNode = HTMLElement | SVGElement | Text | Comment;
export type VNode = VElement | string;
export type Delta = [DeltaTypes, number];
export type Hook = (el?: DOMNode, newVNode?: VNode, oldVNode?: VNode) => boolean;
export type Commit = (work: () => void, data: ReturnType<Driver>) => void;
export type VElementFlags = Exclude<Flags, Flags.ENTITY>;
export type Driver = (
  el: DOMNode,
  newVNode?: VNode,
  oldVNode?: VNode,
  commit?: Commit,
  effects?: Effect[],
  driver?: Driver,
) => {
  el: DOMNode;
  newVNode?: VNode;
  oldVNode?: VNode;
  effects?: Effect[];
  commit?: Commit;
  driver?: Driver;
};

export interface Effect {
  type: EffectTypes;
  flush: () => void;
}

export interface VEntity {
  flag: Flags.ENTITY;
  data: Record<string, unknown>;
  resolve: () => VNode;
  el?: DOMNode;
  key?: string;
}

export interface VElement {
  flag: VElementFlags;
  tag: string;
  props?: VProps;
  children?: VNode[];
  key?: string;
  delta?: Delta[];
}

export enum Flags {
  ENTITY,
  ELEMENT,
  ELEMENT_LEAF,
  ELEMENT_IGNORE,
  ELEMENT_SKIP_DIFF,
  ELEMENT_NO_CHILDREN,
  ELEMENT_TEXT_CHILDREN,
  ELEMENT_KEYED_CHILDREN,
}

export enum EffectTypes {
  CREATE,
  REMOVE,
  REPLACE,
  UPDATE,
  SET_PROP,
  REMOVE_PROP,
}

export const enum DeltaTypes {
  CREATE,
  UPDATE,
  REMOVE,
}
