import {
  P as Props,
  a as VElement,
  V as VNode,
  A as AbstractBlock,
  E as Edit,
} from './types-35702ad2.js';

declare const block: (
  fn: (props?: Props) => VElement,
  unwrap?: ((vnode: any) => VNode) | undefined,
  shouldUpdate?: ((oldProps: Props, newProps: Props) => boolean) | undefined,
) => (
  props?: Props | null,
  key?: string,
  shouldUpdateCurrentBlock?:
    | ((oldProps: Props, newProps: Props) => boolean)
    | undefined,
) => Block;
declare const mount: (
  block: AbstractBlock,
  parent?: HTMLElement,
) => HTMLElement;
declare const patch: (
  oldBlock: AbstractBlock,
  newBlock: AbstractBlock,
) => HTMLElement;
declare class Block extends AbstractBlock {
  r: HTMLElement;
  e: Edit[];
  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string,
    shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
    getElements?: (root: HTMLElement) => HTMLElement[],
  );
  m(parent?: HTMLElement, refNode?: Node | null): HTMLElement;
  p(newBlock: AbstractBlock): HTMLElement;
  v(block?: AbstractBlock | null, refNode?: Node | null): void;
  x(): void;
  u(_oldProps: Props, _newProps: Props): boolean;
  s(): string;
  t(): HTMLElement | null | undefined;
}
declare const stringToDOM: (content: string) => HTMLElement;
declare const withKey: (value: any, key: string) => any;

export {
  Block as B,
  block as b,
  mount as m,
  patch as p,
  stringToDOM as s,
  withKey as w,
};
