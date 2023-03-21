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
import { AbstractBlock, Edits } from './types';
import type { Edit, EditChild, Props, VElement, Hole, VNode } from './types';

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
          return { __key: key };
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
  return mount$.call(block, parent);
};

export const patch = (
  oldBlock: AbstractBlock,
  newBlock: AbstractBlock,
): HTMLElement => {
  if (!oldBlock.el) mount$.call(oldBlock);
  if (
    (oldBlock.key && oldBlock.key === newBlock.key) ||
    oldBlock.root === newBlock.root
  ) {
    return patch$.call(oldBlock, newBlock);
  }
  const el = mount$.call(newBlock, oldBlock.parent()!, oldBlock.el);
  remove$.call(oldBlock);
  oldBlock.key = newBlock.key!;
  return el;
};

export class Block extends AbstractBlock {
  root: HTMLElement;
  edits: Edit[];
  // Cache for getCurrentElement()
  cache = new Map<number, HTMLElement>();

  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string,
    shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
  ) {
    super();
    this.root = root;
    this.props = props;
    this.edits = edits;
    this.key = key;
    if (shouldUpdate) this.shouldUpdate = shouldUpdate;
  }
  mount(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
    if (this.el) return this.el;
    // cloneNode(true) uses less memory than recursively creating new nodes
    const root = cloneNode$.call(this.root, true) as HTMLElement;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      const el =
        current.getRoot?.(root) ??
        getCurrentElement(current.path, root, this.cache, i);
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        // https://jsbench.me/j2klgojvih/1
        const {
          0: type,
          1: name,
          3: hole,
          4: index,
          5: listener,
          7: block,
        } = edit;
        const holeValue = hole ? this.props![hole] : undefined;

        if (type === 'block') {
          block.mount(el, childNodes$.call(el)[index]);
        } else if (type === 'child') {
          if (holeValue instanceof AbstractBlock) {
            holeValue.mount(el);
            continue;
          }
          // insertText() on mount, setText() on patch
          insertText(el, String(holeValue), index);
        } else if (type === 'event') {
          const patch = createEventListener(
            el,
            name,
            // Events can be either a hole or a function
            hole ? holeValue : listener,
          );
          if (hole) {
            edit[Edits.PATCH] = patch;
          }
        } else if (type === 'attribute') {
          setAttribute(el, name, holeValue);
        } else if (type === 'style') {
          if (typeof holeValue === 'string') {
            setStyleAttribute(el, name, holeValue);
          } else {
            for (const style in holeValue) {
              setStyleAttribute(el, style, holeValue[style]);
            }
          }
        } else {
          setSvgAttribute(el, name, holeValue);
        }
      }

      // Handles case for positioning text nodes. When text nodes are
      // put into a template, they can be merged. For example,
      // ["hello", "world"] becomes "helloworld" in the DOM.
      // Inserts text nodes into the DOM at the correct position.
      const initsLength = current.inits.length;
      if (!initsLength) continue;
      for (let k = 0; k < initsLength; ++k) {
        const init = current.inits[k]!;
        insertText(el, init.value, init.index);
      }
    }

    if (parent) {
      insertBefore$.call(parent, root, refNode);
    }
    this.el = root;

    return root;
  }
  patch(newBlock: AbstractBlock): HTMLElement {
    const root = this.el as HTMLElement;
    if (!newBlock.props) return root;
    const props = this.props!;
    // If props are the same, no need to patch
    if (!shouldUpdate$.call(this, props, newBlock.props)) return root;
    this.props = newBlock.props;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      let el: HTMLElement | undefined;
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const { 0: type, 1: name, 3: hole, 4: index, 6: patch } = edit;
        if (type === 'block') {
          const newEdit = newBlock.edits?.[i] as Edit;
          newBlock.patch(newEdit.edits[k]![Edits.BLOCK]!);
          continue;
        }
        if (!hole) continue;
        const oldValue = props[hole];
        const newValue = newBlock.props[hole];

        if (newValue === oldValue) continue;

        if (type === 'event') {
          patch?.(newValue);
          continue;
        }
        if (!el) {
          el =
            current.getRoot?.(root) ??
            getCurrentElement(current.path, root, this.cache, i);
        }
        if (type === 'child') {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = newBlock.edits?.[i]?.edits[k] as EditChild;
            const newChildBlock = newBlock.props[firstEdit[Edits.HOLE]];
            oldValue.patch(newChildBlock);
            continue;
          }
          setText(el, String(newValue), index);
        } else if (type === 'attribute') {
          setAttribute(el, name, newValue);
        } else if (type === 'style') {
          if (typeof newValue === 'string') {
            setStyleAttribute(el, name, newValue);
          } else {
            for (const style in newValue) {
              if (newValue[style] !== oldValue[style]) {
                setStyleAttribute(el, style, newValue[style]);
              }
            }
          }
        } else {
          setSvgAttribute(el, name, newValue);
        }
      }
    }

    return root;
  }
  move(block: AbstractBlock | null = null, refNode: Node | null = null) {
    insertBefore$.call(this.parent, this.el!, block ? block.el! : refNode);
  }
  remove() {
    removeElement$.call(this.el);
    this.el = undefined;
  }
  shouldUpdate(_oldProps: Props, _newProps: Props): boolean {
    return true;
  }
  toString() {
    return String(this.el?.outerHTML);
  }
  parent(): HTMLElement | null | undefined {
    if (!this._parent) this._parent = this.el?.parentElement;
    return this._parent;
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

export const mount$ = Block.prototype.mount;
export const patch$ = Block.prototype.patch;
export const move$ = Block.prototype.move;
export const remove$ = Block.prototype.remove;
export const shouldUpdate$ = Block.prototype.shouldUpdate;
