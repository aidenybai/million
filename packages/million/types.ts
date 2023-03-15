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
  cache?: Map<number, HTMLElement>;
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

export const enum Current {
  PATH,
  EDITS,
  INITS,
}
export const enum Edits {
  TYPE,
  NAME,
  VALUE,
  HOLE,
  INDEX,
  LISTENER,
  PATCH,
  BLOCK,
}

export type EditBase = [
  /* type */ string,
  /* name */ string | undefined,
  /* value */ string | undefined,
  /* hole */ string | undefined,
  /* index */ number | undefined,
  /* listener */ EventListener | undefined,
  /* patch */ ((listener: EventListener) => void) | undefined,
  /* block */ AbstractBlock | undefined,
];

export type EditAttribute = EditBase &
  [
    /* type */ 'attribute',
    /* name */ string,
    /* value */ undefined,
    /* hole */ string,
    /* index */ undefined,
    /* listener */ undefined,
    /* patch */ undefined,
    /* block */ undefined,
  ];

export type EditStyleAttribute = EditBase &
  [
    /* type */ 'style',
    /* name */ string,
    /* value */ undefined,
    /* hole */ string,
    /* index */ undefined,
    /* listener */ undefined,
    /* patch */ undefined,
    /* block */ undefined,
  ];

export type EditSvgAttribute = EditBase &
  [
    /* type */ 'svg',
    /* name */ string,
    /* value */ undefined,
    /* hole */ string,
    /* index */ undefined,
    /* listener */ undefined,
    /* patch */ undefined,
    /* block */ undefined,
  ];

export type EditChild = EditBase &
  [
    /* type */ 'child',
    /* name */ undefined,
    /* value */ undefined,
    /* hole */ string,
    /* index */ number,
    /* listener */ undefined,
    /* patch */ undefined,
    /* block */ undefined,
  ];

export type EditBlock = EditBase &
  [
    /* type */ 'block',
    /* name */ undefined,
    /* value */ undefined,
    /* hole */ undefined,
    /* index */ number,
    /* listener */ undefined,
    /* patch */ undefined,
    /* block */ AbstractBlock,
  ];

export type EditEvent = EditBase &
  [
    /* type */ 'event',
    /* name */ string,
    /* value */ undefined,
    /* hole */ string | undefined,
    /* index */ undefined,
    /* listener */ EventListener,
    /* patch */ ((listener: EventListener) => void) | undefined,
    /* block */ undefined,
  ];

export type Edit = [
  /* path */ number[],
  /* edits */ (
    | EditAttribute
    | EditStyleAttribute
    | EditSvgAttribute
    | EditChild
    | EditBlock
    | EditEvent
  )[],
  /* inits */ (
    | {
        index: number;
        value: string;
      }[]
    | undefined
  ),
];
