declare const enum Flags {
  Child = 1,
  Attribute = 2,
  Event = 4,
  StyleAttribute = 8,
  SvgAttribute = 16,
  Block = 32,
}

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
  $: string;
}

export abstract class AbstractBlock {
  /* root */ r?: HTMLElement;
  /* edits */ e?: Edit[];
  /* el */ l?: HTMLElement | null;
  /* getElements */ g?: (root: HTMLElement) => HTMLElement[];
  /* _parent */ _t?: HTMLElement | null;
  /* props */ d?: Props | null;
  /* key */ k?: string | null;
  /* cache */ c?: HTMLElement[];
  /* patch */ abstract p(block: AbstractBlock): HTMLElement;
  /* mount */ abstract m(
    parent?: HTMLElement,
    refNode?: Node | null,
  ): HTMLElement;
  /* move */ abstract v(
    block: AbstractBlock | null,
    refNode: Node | null,
  ): void;
  /* remove */ abstract x(): void;
  /* toString */ abstract s(): string;
  /* shouldUpdate */ abstract u(oldProps: Props, newProps: Props): boolean;
  /* parent */ abstract t(): HTMLElement | null | undefined;
}

export interface EditBase {
  /* type */ t: Flags;
  /* name */ n: string | null;
  /* value */ v: string | null;
  /* hole */ h: string | null;
  /* index */ i: number | null;
  /* listener */ l: EventListener | null;
  /* patch */ p: ((listener: EventListener) => void) | null;
  /* block */ b: AbstractBlock | null;
}

export interface EditAttribute {
  /* type */ t: Flags.Attribute;
  /* name */ n: string;
  /* value */ v: null;
  /* hole */ h: string;
  /* index */ i: null;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface EditStyleAttribute {
  /* type */ t: Flags.StyleAttribute;
  /* name */ n: string;
  /* value */ v: null;
  /* hole */ h: string;
  /* index */ i: null;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface EditSvgAttribute {
  /* type */ t: Flags.SvgAttribute;
  /* name */ n: string;
  /* value */ v: null;
  /* hole */ h: string;
  /* index */ i: null;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface EditChild {
  /* type */ t: Flags.Child;
  /* name */ n: null;
  /* value */ v: null;
  /* hole */ h: string;
  /* index */ i: number;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface EditEvent {
  /* type */ t: Flags.Event;
  /* name */ n: string;
  /* value */ v: null;
  /* hole */ h: string;
  /* index */ i: null;
  /* listener */ l: null;
  /* patch */ p: ((listener: EventListener) => void) | null;
  /* block */ b: null;
}

export interface InitEvent {
  /* type */ t: Flags.Event;
  /* name */ n: string;
  /* value */ v: null;
  /* hole */ h: null;
  /* index */ i: null;
  /* listener */ l: EventListener;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface InitChild {
  /* type */ t: Flags.Child;
  /* name */ n: null;
  /* value */ v: string;
  /* hole */ h: null;
  /* index */ i: number;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: null;
}

export interface InitBlock {
  /* type */ t: Flags.Block;
  /* name */ n: null;
  /* value */ v: null;
  /* hole */ h: null;
  /* index */ i: number;
  /* listener */ l: null;
  /* patch */ p: null;
  /* block */ b: AbstractBlock;
}

export interface Edit {
  /* path */ p: number[] | null;
  /* edits */ e: (
    | EditAttribute
    | EditStyleAttribute
    | EditSvgAttribute
    | EditChild
    | EditEvent
  )[];
  /* inits */ i: (InitChild | InitEvent | InitBlock)[] | null;
}
