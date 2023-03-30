/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  childNodes$,
  cloneNode$,
  createEventListener,
  insertBefore$,
  insertText,
  innerHTML$,
  remove$ as removeElement$,
  setAttribute,
  setText,
  setStyleAttribute,
  setSvgAttribute,
  firstChild$,
  nextSibling$,
  mapSet$,
  mapHas$,
  mapGet$,
} from './dom';
import { renderToTemplate } from './template';
import { AbstractBlock, Flags } from './types';
import { fragmentMount$, fragmentPatch$ } from './fragment';
import type { FragmentBlock } from './fragment';
import type { EditChild, Props, VElement, Hole, VNode, Edit } from './types';

export const block = (
  fn: (props?: Props) => VElement,
  unwrap?: (vnode: any) => VNode,
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
) => {
  const vnode = fn(
    new Proxy(
      {},
      {
        // A universal getter will return a Hole instance if props[any] is accessed
        // Allows code to identify holes in virtual nodes ("digs" them out)
        get(_, key: string): Hole {
          return { $: key };
        },
      },
    ),
  );
  const edits: Edit[] = [];

  // Turns vnode into a string of HTML and creates an array of "edits"
  // Edits are instructions for how to update the DOM given some props
  const root = stringToDOM(
    renderToTemplate(unwrap ? unwrap(vnode) : vnode, edits),
  );

  return (
    props?: Props | null,
    key?: string,
    shouldUpdateCurrentBlock?: (oldProps: Props, newProps: Props) => boolean,
  ) => {
    return new Block(
      root,
      edits,
      props,
      key ?? props?.key,
      shouldUpdateCurrentBlock ?? shouldUpdate,
    );
  };
};

export const mount = (
  block: AbstractBlock,
  parent?: HTMLElement,
): HTMLElement => {
  if ('b' in block && parent) {
    return fragmentMount$.call(block, parent);
  }
  return mount$.call(block, parent);
};

export const patch = (
  oldBlock: AbstractBlock,
  newBlock: AbstractBlock,
): HTMLElement => {
  if ('b' in oldBlock || 'b' in newBlock) {
    fragmentPatch$.call(oldBlock, newBlock as FragmentBlock);
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
  r: HTMLElement;
  e: Edit[];
  // Cache for getCurrentElement()
  c = new Map<number, HTMLElement>();

  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string,
    shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
  ) {
    super();
    this.r = root;
    this.d = props;
    this.e = edits;
    this.k = key;
    if (shouldUpdate) this.u = shouldUpdate;
  }
  m(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
    if (this.l) return this.l;
    // cloneNode(true) uses less memory than recursively creating new nodes
    const root = cloneNode$.call(this.r, true) as HTMLElement;

    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i]!;
      const el = current.r
        ? current.r(root)
        : current.p
        ? getCurrentElement(current.p, root, this.c, i)
        : root;
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k]!;
        const value = this.d![edit.h];

        if (edit.t & Flags.Child) {
          if (value instanceof AbstractBlock) {
            value.m(el);
            continue;
          }
          // insertText() on mount, setText() on patch
          insertText(el, String(value), edit.i!);
        } else if (edit.t & Flags.Event) {
          const patch = createEventListener(el, edit.n!, value);
          edit.p = patch;
        } else if (edit.t & Flags.Attribute) {
          setAttribute(el, edit.n!, value);
        } else if (edit.t & Flags.StyleAttribute) {
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

        if (init.t & Flags.Child) {
          // Handles case for positioning text nodes. When text nodes are
          // put into a template, they can be merged. For example,
          // ["hello", "world"] becomes "helloworld" in the DOM.
          // Inserts text nodes into the DOM at the correct position.
          insertText(el, init.v, init.i!);
        } else if (init.t & Flags.Event) {
          createEventListener(el, init.n!, init.l!);
        } else {
          init.b!.m(el, childNodes$.call(el)[init.i!]);
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
    const root = this.l as HTMLElement;
    if (!newBlock.d) return root;
    const props = this.d!;
    // If props are the same, no need to patch
    if (!shouldUpdate$.call(this, props, newBlock.d)) return root;
    this.d = newBlock.d;

    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i]!;
      let el: HTMLElement | undefined;
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k]!;
        const oldValue = props[edit.h];
        const newValue = newBlock.d[edit.h];

        if (newValue === oldValue) continue;

        if (edit.t & Flags.Event) {
          edit.p!(newValue);
          continue;
        }
        if (!el) {
          el = current.r
            ? current.r(root)
            : current.p
            ? getCurrentElement(current.p, root, this.c, i)
            : this.l!;
        }
        if (edit.t & Flags.Child) {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = newBlock.e?.[i]?.e[k] as EditChild;
            const newChildBlock = newBlock.d[firstEdit.h];
            oldValue.p(newChildBlock);
            continue;
          }
          setText(el, String(newValue), edit.i!);
        } else if (edit.t & Flags.Attribute) {
          setAttribute(el, edit.n!, newValue);
        } else if (edit.t & Flags.StyleAttribute) {
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
    this.l = undefined;
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
  cache?: Map<number, HTMLElement>,
  key?: number,
): HTMLElement => {
  const pathLength = path.length;
  if (!pathLength) return root;
  if (cache && key !== undefined && mapHas$.call(cache, path)) {
    return mapGet$.call(cache, path)!;
  }
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes:
  // root.firstChild.firstChild.nextSibling.firstChild.nextSibling.nextSibling
  // We use path because we don't have the actual DOM nodes until mount()
  for (let i = 0; i < pathLength; ++i) {
    const siblings = path[i]!;
    // https://www.measurethat.net/Benchmarks/Show/15652/0/childnodes-vs-children-vs-firstchildnextsibling-vs-firs
    root = firstChild$.call(root);
    if (!siblings) continue;
    for (let j = 0; j < siblings; ++j) {
      root = nextSibling$.call(root) as HTMLElement;
    }
  }
  if (cache && key !== undefined) mapSet$.call(cache, key, root);
  return root;
};

export const stringToDOM = (content: string) => {
  const template = document.createElement('template');
  innerHTML$.call(template, content);
  return template.content.firstChild as HTMLElement;
};

export const withKey = (value: any, key: string) => {
  value.key = key;
  return value;
};

export const mount$ = Block.prototype.m;
export const patch$ = Block.prototype.p;
export const move$ = Block.prototype.v;
export const remove$ = Block.prototype.x;
export const shouldUpdate$ = Block.prototype.u;
