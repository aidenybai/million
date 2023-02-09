import type { Hole } from "./block";

/* eslint-disable @typescript-eslint/no-empty-function */
export type Props = Record<string, any>;

export type VNode = string | VElement;

export class Block {
  el?: HTMLElement;
  _parent?: HTMLElement | null;
  props?: Props | null;
  key?: string;
  edits?: Edit[];
  cache?: Map<number, HTMLElement>;
  patch(_block: Block) {}
  mount(_parent?: HTMLElement, _refNode: Node | null = null) {}
  move(_block: Block | null = null, _refNode: Node | null = null) {}
  remove() {}
  toString() {}
  get parent(): HTMLElement | null | undefined {
    return this._parent;
  }
}

export interface VElement {
  flag: Flags;
  tag: string;
  props?: Props;
  children?: VNode[];
  ref?: any;
  key?: string;
  dom?: HTMLElement;
  parent?: VElement;
}

export enum Flags {
  ELEMENT,
  ELEMENT_IGNORE,
  ELEMENT_FORCE_UPDATE,
  ELEMENT_NO_CHILDREN,
  ELEMENT_TEXT_CHILDREN,
  ELEMENT_KEYED_CHILDREN,
}

export type Delta = [DeltaTypes, number];

export const enum DeltaTypes {
  CREATE,
  UPDATE,
  REMOVE,
}

export const enum EditType {
  Attribute,
  Block,
  Child,
  Event,
  Text,
}

export interface EditAttribute {
  type: EditType.Attribute;
  name: string;
  hole: Hole;
  static?: boolean;
}

export interface EditChild {
  type: EditType.Child;
  index: number;
  hole: Hole;
  static?: boolean;
}

export interface EditBlock {
  type: EditType.Block;
  block: Block;
  index: number;
}

export interface EditEvent {
  type: EditType.Event;
  name: string;
  listener: EventListener;
  patch?: (newValue: EventListener) => void;
  hole?: Hole;
  static?: boolean;
}

export interface EditText {
  type: EditType.Text;
  value: string;
  index: number;
}

export interface Edit {
  path: number[];
  edits: (EditAttribute | EditChild | EditBlock | EditEvent)[];
  inits: (EditEvent | EditText)[];
}
