/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  cloneNode$,
  createEventListener,
  insertBefore$,
  insertText,
  remove$ as removeElement$,
  setAttribute,
  setText,
  setStyleAttribute,
  setSvgAttribute,
  HTM_TEMPLATE_CONTENT,
  SVG_TEMPLATE_CONTENT,
  childAt,
  SVG_TEMPLATE,
  HTM_TEMPLATE,
} from './dom';
import { renderToTemplate } from './template';
import { AbstractBlock } from './types';
import { arrayMount$, arrayPatch$ } from './array';
import {
  TEXT_NODE_CACHE,
  AttributeFlag,
  ChildFlag,
  EventFlag,
  StyleAttributeFlag,
  EVENT_PATCH,
} from './constants';
import type { ArrayBlock } from './array';
import type { EditChild, Props, VElement, Hole, VNode, Edit } from './types';

const HOLE_PROXY = new Proxy(
  {},
  {
    // A universal getter will return a Hole instance if props[any] is accessed
    // Allows code to identify holes in virtual nodes ("digs" them out)
    get(_, key: string): Hole {
      return { $: key };
    },
  },
);

export const block = (
  fn: (props?: Props) => VElement,
  unwrap?: (vnode: any) => VNode,
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
  svg?: boolean,
) => {
  const vnode = fn(HOLE_PROXY);
  const edits: Edit[] = [];

  // Turns vnode into a string of HTML and creates an array of "edits"
  // Edits are instructions for how to update the DOM given some props
  const root = stringToDOM(
    renderToTemplate(unwrap ? unwrap(vnode) : vnode, edits),
    svg,
  );

  return <T extends Props>(
    props?: T | null,
    key?: string,
    shouldUpdateCurrentBlock?: (oldProps: Props, newProps: Props) => boolean,
  ) => {
    return new Block(
      root,
      edits,
      props,
      key ?? props?.key ?? null,
      shouldUpdateCurrentBlock ?? shouldUpdate ?? null,
      null,
    );
  };
};

export const mount = (block: AbstractBlock, parent?: HTMLElement) => {
  if ('b' in block && parent) {
    return arrayMount$.call(block, parent);
  }
  return mount$.call(block, parent);
};

export const patch = (oldBlock: AbstractBlock, newBlock: AbstractBlock) => {
  if ('b' in oldBlock || 'b' in newBlock) {
    arrayPatch$.call(oldBlock, newBlock as ArrayBlock);
  }

  if (!oldBlock.l) mount$.call(oldBlock);
  if ((oldBlock.k && oldBlock.k === newBlock.k) || oldBlock.r === newBlock.r) {
    return patch$.call(oldBlock, newBlock);
  }
  const el = mount$.call(newBlock, oldBlock.t()!, oldBlock.l);
  remove$.call(oldBlock);
  oldBlock.k = newBlock.k!;
  return el;
};

export class Block extends AbstractBlock {
  declare r: HTMLElement;
  declare e: Edit[];

  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string | null,
    shouldUpdate?: ((oldProps: Props, newProps: Props) => boolean) | null,
    getElements?: ((root: HTMLElement) => HTMLElement[]) | null,
  ) {
    super();
    this.r = root;
    this.d = props;
    this.e = edits;
    this.k = key;
    this.c = Array(edits.length);
    if (shouldUpdate) this.u = shouldUpdate;
    if (getElements) this.g = getElements;
  }
  m(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
    if (this.l) return this.l;
    // cloneNode(true) uses less memory than recursively creating new nodes
    const root = cloneNode$.call(this.r, true) as HTMLElement;
    const elements = this.g?.(root);
    if (elements) this.c = elements;

    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i]!;
      const el =
        elements?.[i] ?? getCurrentElement(current.p!, root, this.c, i);
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k]!;
        const value = this.d![edit.h];

        if (edit.t & ChildFlag) {
          if (value instanceof AbstractBlock) {
            value.m(el);
            continue;
          }
          if (!el[TEXT_NODE_CACHE]) el[TEXT_NODE_CACHE] = new Array(l);

          if (typeof value === 'function') {
            const scopeEl = value(null);
            el[TEXT_NODE_CACHE][k] = scopeEl;
            insertBefore$.call(el, scopeEl, childAt(el, edit.i!));
            continue;
          }
          // insertText() on mount, setText() on patch
          el[TEXT_NODE_CACHE][k] = insertText(
            el,
            value === null || value === undefined || value === false
              ? ''
              : String(value),
            edit.i!,
          );
        } else if (edit.t & EventFlag) {
          const patch = createEventListener(el, edit.n!, value);
          el[EVENT_PATCH + edit.n!] = patch;
        } else if (edit.t & AttributeFlag) {
          setAttribute(el, edit.n!, value);
        } else if (edit.t & StyleAttributeFlag) {
          if (typeof value === 'string') {
            setStyleAttribute(el, edit.n!, value);
          } else {
            for (const style in value) {
              setStyleAttribute(el, style, value[style]);
            }
          }
        } else {
          setSvgAttribute(el, edit.n!, value);
        }
      }

      const initsLength = current.i?.length;
      if (!initsLength) continue;
      for (let k = 0; k < initsLength; ++k) {
        const init = current.i![k]!;

        if (init.t & ChildFlag) {
          // Handles case for positioning text nodes. When text nodes are
          // put into a template, they can be merged. For example,
          // ["hello", "world"] becomes "helloworld" in the DOM.
          // Inserts text nodes into the DOM at the correct position.
          insertText(el, init.v, init.i!);
        } else if (init.t & EventFlag) {
          createEventListener(el, init.n!, init.l!);
        } else {
          init.b!.m(el, childAt(el, init.i!));
        }
      }
    }

    if (parent) {
      insertBefore$.call(parent, root, refNode);
    }
    this.l = root;

    return root;
  }
  p(newBlock: AbstractBlock): HTMLElement {
    const root = this.l!;
    if (!newBlock.d) return root;
    const props = this.d!;
    // If props are the same, no need to patch
    if (!shouldUpdate$.call(this, props, newBlock.d)) return root;
    this.d = newBlock.d;

    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i]!;
      const el: HTMLElement =
        this.c![i] ?? getCurrentElement(current.p!, root, this.c, i);
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k]!;
        const oldValue = props[edit.h];
        const newValue = newBlock.d[edit.h];

        if (newValue === oldValue) continue;

        if (edit.t & EventFlag) {
          el[EVENT_PATCH + edit.n!]!(newValue);
          continue;
        }
        if (edit.t & ChildFlag) {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = newBlock.e?.[i]?.e[k] as EditChild;
            const newChildBlock = newBlock.d[firstEdit.h];
            oldValue.p(newChildBlock);
            continue;
          }
          if (typeof newValue === 'function') {
            newValue(el[TEXT_NODE_CACHE][k]);
            continue;
          }
          setText(
            el[TEXT_NODE_CACHE][k],
            newValue === null || newValue === undefined || newValue === false
              ? ''
              : String(newValue),
          );
        } else if (edit.t & AttributeFlag) {
          setAttribute(el, edit.n!, newValue);
        } else if (edit.t & StyleAttributeFlag) {
          if (typeof newValue === 'string') {
            setStyleAttribute(el, edit.n!, newValue);
          } else {
            for (const style in newValue) {
              if (newValue[style] !== oldValue[style]) {
                setStyleAttribute(el, style, newValue[style]);
              }
            }
          }
        } else {
          setSvgAttribute(el, edit.n!, newValue);
        }
      }
    }

    return root;
  }
  v(block: AbstractBlock | null = null, refNode: Node | null = null) {
    insertBefore$.call(this.t(), this.l!, block ? block.l! : refNode);
  }
  x() {
    removeElement$.call(this.l);
    this.l = null;
  }
  u(_oldProps: Props, _newProps: Props): boolean {
    return true;
  }
  s() {
    return String(this.l?.outerHTML);
  }
  t(): HTMLElement | null | undefined {
    if (!this._t) this._t = this.l?.parentElement;
    return this._t;
  }
}

const getCurrentElement = (
  path: number[],
  root: HTMLElement,
  cache?: HTMLElement[],
  key?: number,
): HTMLElement => {
  const pathLength = path.length;
  if (!pathLength) return root;
  if (cache && key !== undefined && cache[key]) {
    return cache[key]!;
  }
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes:
  // root.firstChild.firstChild.nextSibling.firstChild.nextSibling.nextSibling
  // We use path because we don't have the actual DOM nodes until mount()
  for (let i = 0; i < pathLength; ++i) {
    const siblings = path[i]!;
    root = childAt(root, siblings);
  }
  if (cache && key !== undefined) cache[key] = root;
  return root;
};

export const stringToDOM = (content: string, svg?: boolean) => {
  const template = svg ? SVG_TEMPLATE : HTM_TEMPLATE;
  template.innerHTML = content;
  const dom = svg ? SVG_TEMPLATE_CONTENT : HTM_TEMPLATE_CONTENT;
  return dom.firstChild as HTMLElement;
};

export const withKey = (value: any, key: string) => {
  value.key = key;
  return value;
};

const block$ = Block.prototype;

export const mount$ = block$.m;
export const patch$ = block$.p;
export const move$ = block$.v;
export const remove$ = block$.x;
export const shouldUpdate$ = block$.u;
