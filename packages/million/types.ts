export type VNode =
  | VElement
  | string
  | number
  | bigint
  | boolean
  | undefined
  | null;

export type Props = Record<string, any>;
export interface VElement {
  type: string;
  props: Props & { children?: (VNode | Hole)[] };
}

export interface Hole {
  __key: string;
}

export abstract class AbstractBlock {
  root?: HTMLElement | null;
  edits?: Edit[];
  el?: HTMLElement;
  _parent?: HTMLElement | null;
  props?: Props | null;
  key?: string;
  cache?: Map<number, HTMLElement>;
  abstract patch(block: AbstractBlock): HTMLElement;
  abstract mount(parent?: HTMLElement, refNode?: Node | null): HTMLElement;
  abstract move(block: AbstractBlock | null, refNode: Node | null): void;
  abstract remove(): void;
  abstract toString(): string;
  abstract shouldUpdate(oldProps: Props, newProps: Props): boolean;
  abstract parent(): HTMLElement | null | undefined;
}

export const enum Flags {
  CHILD = 1,
  EVENT = 2,
  ATTRIBUTE = 4,
  STYLE_ATTRIBUTE = 8,
  SVG_ATTRIBUTE = 16,
  BLOCK = 32,
}

export interface EditBase {
  type: Flags;
  name?: string | null;
  value?: string | null;
  hole?: string | null;
  index?: number | null;
  listener?: EventListener | null;
  patch?: ((listener: EventListener) => void) | null;
  block?: AbstractBlock | null;
  next?: EditBase | null;
}

export interface EditAttribute extends EditBase {
  type: Flags.ATTRIBUTE;
  name: string;
  value: null;
  hole: string;
  index: null;
  listener: null;
  patch: null;
  block: null;
}

export interface EditStyleAttribute extends EditBase {
  type: Flags.STYLE_ATTRIBUTE;
  name: string;
  value: null;
  hole: string;
  index: null;
  listener: null;
  patch: null;
  block: null;
}

export interface EditSvgAttribute extends EditBase {
  type: Flags.SVG_ATTRIBUTE;
  name: string;
  value: null;
  hole: string;
  index: null;
  listener: null;
  patch: null;
  block: null;
}

export interface EditChild extends EditBase {
  type: Flags.CHILD;
  name: null;
  value: null;
  hole: string;
  index: number;
  listener: null;
  patch: null;
  block: null;
}

export interface EditEvent extends EditBase {
  type: Flags.EVENT;
  name: string;
  value: null;
  hole: string;
  index: null;
  listener: null;
  patch: ((listener: EventListener) => void) | null;
  block: null;
}

export interface InitEvent extends EditBase {
  type: Flags.EVENT;
  name: string;
  value: null;
  hole: null;
  index: null;
  listener: EventListener;
  patch: null;
  block: null;
}

export interface InitChild extends EditBase {
  type: Flags.CHILD;
  name: null;
  value: string;
  hole: null;
  index: number;
  listener: null;
  patch: null;
  block: null;
}

export interface InitBlock extends EditBase {
  type: Flags.BLOCK;
  name: null;
  value: null;
  hole: null;
  index: number;
  listener: null;
  patch: null;
  block: AbstractBlock;
}

export interface Edit {
  edits: Record<
    string,
    | EditAttribute
    | EditStyleAttribute
    | EditSvgAttribute
    | EditChild
    | EditEvent
    | null
  >;
  inits: InitChild | InitBlock | InitEvent | null;
  getRoot: (
    el: HTMLElement,
    cache: Map<number, HTMLElement>,
    key: number,
  ) => HTMLElement;
}
