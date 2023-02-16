/* eslint-disable @typescript-eslint/no-empty-function */

export type { VNode, VElement } from '../million/types';
export type Props = Record<string, any>;

export class Hole {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
}

export abstract class AbstractBlock {
  root?: HTMLElement;
  edits?: Edit[];
  el?: HTMLElement;
  _parent?: HTMLElement | null;
  props?: Props | null;
  key?: string;
  cache?: Map<number, HTMLElement>;
  abstract patch(block: AbstractBlock): HTMLElement;
  abstract mount(parent?: HTMLElement, refNode: Node | null): HTMLElement;
  abstract move(block: AbstractBlock | null = null, refNode: Node | null): void;
  abstract remove(): void;
  abstract toString(): string;
  get parent(): HTMLElement | null | undefined {
    return this._parent;
  }
}

export const enum EditType {
  Attribute,
  Block,
  Child,
  Event,
}

export interface EditBase {
  type: EditType;
  name?: string;
  value?: string;
  hole?: string;
  index?: number;
  listener?: EventListener;
  patch?: (listener: EventListener) => void;
  block?: AbstractBlock;
}

export interface EditAttribute extends EditBase {
  type: EditType.Attribute;
  hole: string;
  name: string;
}

export interface EditChild extends EditBase {
  type: EditType.Child;
  hole: string;
  index: number;
}

export interface EditBlock extends EditBase {
  type: EditType.Block;
  block: AbstractBlock;
  index: number;
}

export interface EditEvent extends EditBase {
  type: EditType.Event;
  hole?: string;
  name: string;
  listener: EventListener;
  patch?: (listener: EventListener) => void;
}

export interface Edit {
  path: number[];
  edits: (EditAttribute | EditChild | EditBlock | EditEvent)[];
  inits: {
    index: number;
    value: string;
  }[];
}
