declare const enum Flags {
  Child = 1,
  Attribute = 2,
  Event = 4,
  StyleAttribute = 8,
  SvgAttribute = 16,
  Block = 32,
}
type VNode = VElement | string | number | bigint | boolean | undefined | null;
type Props = Record<string, any>;
interface VElement {
  type: string;
  props: Props & {
    children?: (VNode | Hole)[];
  };
}
interface Hole {
  $: string;
}
declare abstract class AbstractBlock {
  r?: HTMLElement;
  e?: Edit[];
  l?: HTMLElement | null;
  g?: (root: HTMLElement) => HTMLElement[];
  _t?: HTMLElement | null;
  d?: Props | null;
  k?: string;
  c?: HTMLElement[];
  abstract p(block: AbstractBlock): HTMLElement;
  abstract m(parent?: HTMLElement, refNode?: Node | null): HTMLElement;
  abstract v(block: AbstractBlock | null, refNode: Node | null): void;
  abstract x(): void;
  abstract s(): string;
  abstract u(oldProps: Props, newProps: Props): boolean;
  abstract t(): HTMLElement | null | undefined;
}
interface EditAttribute {
  t: Flags.Attribute;
  n: string;
  v: null;
  h: string;
  i: null;
  l: null;
  p: null;
  b: null;
}
interface EditStyleAttribute {
  t: Flags.StyleAttribute;
  n: string;
  v: null;
  h: string;
  i: null;
  l: null;
  p: null;
  b: null;
}
interface EditSvgAttribute {
  t: Flags.SvgAttribute;
  n: string;
  v: null;
  h: string;
  i: null;
  l: null;
  p: null;
  b: null;
}
interface EditChild {
  t: Flags.Child;
  n: null;
  v: null;
  h: string;
  i: number;
  l: null;
  p: null;
  b: null;
}
interface EditEvent {
  t: Flags.Event;
  n: string;
  v: null;
  h: string;
  i: null;
  l: null;
  p: ((listener: EventListener) => void) | null;
  b: null;
}
interface InitEvent {
  t: Flags.Event;
  n: string;
  v: null;
  h: null;
  i: null;
  l: EventListener;
  p: null;
  b: null;
}
interface InitChild {
  t: Flags.Child;
  n: null;
  v: string;
  h: null;
  i: number;
  l: null;
  p: null;
  b: null;
}
interface InitBlock {
  t: Flags.Block;
  n: null;
  v: null;
  h: null;
  i: number;
  l: null;
  p: null;
  b: AbstractBlock;
}
interface Edit {
  p: number[] | null;
  e: (
    | EditAttribute
    | EditStyleAttribute
    | EditSvgAttribute
    | EditChild
    | EditEvent
  )[];
  i: (InitChild | InitEvent | InitBlock)[] | null;
}

export { AbstractBlock as A, Edit as E, Props as P, VNode as V, VElement as a };
