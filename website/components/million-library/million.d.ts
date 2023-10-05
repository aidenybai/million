export {
  B as Block,
  b as block,
  m as mount,
  p as patch,
  s as stringToDOM,
  w as withKey,
} from './block-878fb9ae.js';
import { A as AbstractBlock, V as VNode, E as Edit } from './types-35702ad2.js';
export {
  A as AbstractBlock,
  P as Props,
  a as VElement,
  V as VNode,
} from './types-35702ad2.js';

declare const mapArray: (children: AbstractBlock[]) => ArrayBlock;
declare class ArrayBlock extends AbstractBlock {
  b: AbstractBlock[];
  constructor(children: AbstractBlock[]);
  v(): void;
  p(fragment: ArrayBlock): HTMLElement;
  m(parent: HTMLElement, refNode?: Node | null): HTMLElement;
  x(): void;
  u(): boolean;
  s(): string;
  t(): HTMLElement | null | undefined;
}

declare const renderToTemplate: (
  vnode: VNode,
  edits?: Edit[],
  path?: number[],
) => string;

declare const firstChild$: () => any;
declare const nextSibling$: () => any;

export { ArrayBlock, firstChild$, mapArray, nextSibling$, renderToTemplate };
