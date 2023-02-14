/* eslint-disable @typescript-eslint/no-empty-function */

export type { VNode, VElement } from '../million/types';
export type Props = Record<string, any>;

export class Hole {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
}

export class AbstractBlock {
  root?: HTMLElement;
  edits?: Edit[];
  el?: HTMLElement;
  _parent?: HTMLElement | null;
  props?: Props | null;
  key?: string;
  cache?: Map<number, HTMLElement>;
  patch(_block: AbstractBlock) {}
  mount(_parent?: HTMLElement, _refNode: Node | null = null) {}
  move(_block: AbstractBlock | null = null, _refNode: Node | null = null) {}
  remove() {}
  toString() {}
  get parent(): HTMLElement | null | undefined {
    return this._parent;
  }
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
  hole: Hole;
  name: string;
}

export interface EditChild {
  type: EditType.Child;
  hole: Hole;
  index: number;
}

export interface EditBlock {
  type: EditType.Block;
  block: AbstractBlock;
  index: number;
}

export interface EditEvent {
  type: EditType.Event;
  hole?: Hole;
  name: string;
  listener: EventListener;
  patch?: (listener: EventListener) => void;
}

export interface EditText {
  type: EditType.Text;
  index: number;
  value: string;
}

export interface Edit {
  path: number[];
  edits: (EditAttribute | EditChild | EditBlock | EditEvent)[];
  inits: EditText[];
}
