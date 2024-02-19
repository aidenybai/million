import type { MillionProps } from '../types';

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

export interface VElement {
  type: string;
  props: MillionProps & { children?: (VNode | Hole)[] };
  // Note: VElement is not supposed to accept number, however,
  // to preserve type compatibility with React, we accept a number, but that gets converted to a string
  // whenever it gets converted to a block
  key?: string | number;
}

export interface Hole {
  $: string;
}

export abstract class AbstractBlock {
  /* root */ r?: HTMLElement;
  /* edits */ e?: Edit[];
  /* el */ l?: HTMLElement | null;
  /* getElements */ g?: ((root: HTMLElement) => HTMLElement[]) | null;
  /* _shouldUpdate */ _u?:
    | ((oldProps: MillionProps, newProps: MillionProps) => boolean)
    | null;
  /* _parent */ _t?: HTMLElement | null;
  /* props */ d?: MillionProps | null;
  /* key */ k?: string | null;
  /* cache */ c?: HTMLElement[];
  /* patch */ abstract p(block: AbstractBlock): HTMLElement;
  /* mount */ abstract m(
    parent?: HTMLElement,
    refNode?: Node | null,
    hydrateNode?: Node | null,
  ): HTMLElement;
  /* move */ abstract v(
    block: AbstractBlock | null,
    refNode: Node | null,
  ): void;
  /* remove */ abstract x(): void;
  /* shouldUpdate */ abstract u(
    oldProps: MillionProps,
    newProps: MillionProps,
  ): boolean;
  /* toString */ abstract s(): string;
  /* parent */ abstract t(): HTMLElement | null | undefined;
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
