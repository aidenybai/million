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
  root?: HTMLElement;
  edits?: Edit[];
  el?: HTMLElement;
  _parent?: HTMLElement | null;
  props?: Props | null;
  key?: string;
  cache?: WeakMap<Edit, HTMLElement>;
  abstract patch(block: AbstractBlock): HTMLElement;
  abstract mount(parent?: HTMLElement, refNode?: Node | null): HTMLElement;
  abstract move(block: AbstractBlock | null, refNode: Node | null): void;
  abstract remove(): void;
  abstract toString(): string;
  shouldUpdate?(oldProps: Props, newProps: Props): boolean;
  get parent(): HTMLElement | null | undefined {
    return this._parent;
  }
}

export interface EditBase {
  type: string;
  name?: string;
  value?: string;
  hole?: string;
  index?: number;
  listener?: EventListener;
  patch?: (listener: EventListener) => void;
  block?: AbstractBlock;
}

export interface EditAttribute extends EditBase {
  type: 'attribute';
  hole: string;
  name: string;
}

export interface EditStyleAttribute extends EditBase {
  type: 'style';
  hole: string;
  name: string;
}

export interface EditSvgAttribute extends EditBase {
  type: 'svg';
  hole: string;
  name: string;
}

export interface EditChild extends EditBase {
  type: 'child';
  hole: string;
  index: number;
}

export interface EditBlock extends EditBase {
  type: 'block';
  block: AbstractBlock;
  index: number;
}

export interface EditEvent extends EditBase {
  type: 'event';
  hole?: string;
  name: string;
  listener: EventListener;
  patch?: (listener: EventListener) => void;
}

export interface Edit {
  path: number[];
  edits: (
    | EditAttribute
    | EditStyleAttribute
    | EditSvgAttribute
    | EditChild
    | EditBlock
    | EditEvent
  )[];
  inits: {
    index: number;
    value: string;
  }[];
}
