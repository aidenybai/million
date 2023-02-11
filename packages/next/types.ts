import type { Hole } from './block';

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

export interface BaseEdit {
  type: EditType;
  mount(el: HTMLElement, value?: any): void;
}

export interface EditAttribute extends BaseEdit {
  type: EditType.Attribute;
  hole: Hole;
  patch(el: HTMLElement, value: any): void;
}

export interface EditChild extends BaseEdit {
  type: EditType.Child;
  hole: Hole;
  patch(el: HTMLElement, value: any): void;
}

export interface EditBlock extends BaseEdit {
  type: EditType.Block;
  patch(block: Block): void;
}

export interface EditEvent extends BaseEdit {
  type: EditType.Event;
  listener: EventListener;
  hole?: Hole;
  patch?(newValue: EventListener): void;
}

export interface EditText extends BaseEdit {
  type: EditType.Text;
}

export interface Edit {
  path: number[];
  edits: (EditAttribute | EditChild | EditBlock | EditEvent)[];
  inits: (EditEvent | EditText)[];
}
