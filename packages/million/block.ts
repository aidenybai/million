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
} from './dom';
import { renderToTemplate } from './template';
import { AbstractBlock, Flags } from './types';
import type {
  EditBase,
  Edit,
  EditChild,
  Props,
  VElement,
  Hole,
  VNode,
} from './types';

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

  // Turns vnode into a string of HTML and creates an array of "edits"
  // Edits are instructions for how to update the DOM given some props
  const edits = [];
  const root = stringToDOM(
    renderToTemplate(unwrap ? unwrap(vnode) : vnode, edits, []),
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
    if (!this.edits) return root;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      const el = current.getRoot(root, this.cache, i);

      for (const prop in this.props) {
        let edit = current.edits[prop];
        if (!edit) continue;
        do {
          const value = this.props[prop];
          if (edit.type & Flags.CHILD) {
            if (value instanceof AbstractBlock) {
              value.mount(el);
              continue;
            }
            // insertText() on mount, setText() on patch
            insertText(el, String(value), edit.index!);
          } else if (edit.type & Flags.EVENT) {
            const patch = createEventListener(
              el,
              edit.name!,
              // Events can be either a hole or a function
              value,
            );
            edit.patch = patch;
          } else if (edit.type & Flags.ATTRIBUTE) {
            setAttribute(el, edit.name!, value);
          } else if (edit.type & Flags.STYLE_ATTRIBUTE) {
            if (typeof value === 'string') {
              setStyleAttribute(el, edit.name!, value);
            } else {
              for (const style in value) {
                setStyleAttribute(el, style, value[style]);
              }
            }
          } else {
            setSvgAttribute(el, edit.name!, value);
          }
        } while ((edit = edit.next as any));
      }

      let init = current.inits;
      if (!init) continue;
      do {
        if (init.type & Flags.BLOCK) {
          init.block!.mount(el, childNodes$.call(el)[init.index!]);
        } else if (init.type & Flags.CHILD) {
          // Handles case for positioning text nodes. When text nodes are
          // put into a template, they can be merged. For example,
          // ["hello", "world"] becomes "helloworld" in the DOM.
          // Inserts text nodes into the DOM at the correct position.
          insertText(el, init.value!, init.index!);
        } else if (init.type & Flags.EVENT) {
          createEventListener(
            el,
            init.name!,
            // Events can be either a hole or a function
            init.listener!,
          );
        }
      } while ((init = init.next as any));
    }

    if (parent) {
      insertBefore$.call(parent, root, refNode);
    }
    this.el = root;

    return root;
  }
  patch(newBlock: AbstractBlock): HTMLElement {
    const root = this.el as HTMLElement;
    if (!newBlock.props || !this.edits) return root;
    const props = this.props!;
    // If props are the same, no need to patch
    if (!shouldUpdate$.call(this, props, newBlock.props)) return root;
    const dirtyProps: string[] = [];
    for (const prop in props) {
      if (newBlock.props[prop] !== props[prop]) dirtyProps.push(prop);
    }
    const dirtyPropsLength = dirtyProps.length;
    if (!dirtyPropsLength) return root;
    this.props = newBlock.props;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      let el: HTMLElement | undefined;
      let iter = 0;
      for (let k = 0; k < dirtyPropsLength; ++k) {
        const prop = dirtyProps[k]!;
        let edit = current.edits[prop];

        if (!edit) continue;
        do {
          const oldValue = props[prop];
          const newValue = newBlock.props[prop];
          if (edit.type & Flags.EVENT) {
            edit.patch!(newValue);
            continue;
          }
          if (!el) el = current.getRoot(root, this.cache, i);
          if (edit.type & Flags.CHILD) {
            if (oldValue instanceof AbstractBlock) {
              // Remember! If we find a block inside a child, we need to locate
              // the cooresponding block in the new props and patch it.
              const firstEdit = extractNode(
                newBlock.edits?.[i]?.edits[prop] as EditBase,
                iter,
              ) as EditChild;
              const newChildBlock = newBlock.props[firstEdit.hole];
              oldValue.patch(newChildBlock);
              continue;
            }
            setText(el, String(newValue), edit.index!);
          } else if (edit.type & Flags.ATTRIBUTE) {
            setAttribute(el, edit.name!, newValue);
          } else if (edit.type & Flags.STYLE_ATTRIBUTE) {
            if (typeof newValue === 'string') {
              setStyleAttribute(el, edit.name!, newValue);
            } else {
              for (const style in newValue) {
                if (newValue[style] !== oldValue[style]) {
                  setStyleAttribute(el, style, newValue[style]);
                }
              }
            }
          } else {
            setSvgAttribute(el, edit.name!, newValue);
          }
          ++iter;
        } while ((edit = edit.next as any));
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

export const stringToDOM = (content: string) => {
  const template = document.createElement('template');
  innerHTML$.call(template, content);
  return template.content.firstChild as HTMLElement;
};

export const withKey = (value: any, key: string) => {
  value.key = key;
  return value;
};

export const extractNode = (node: EditBase, iter: number) => {
  if (iter === 0) return node;
  return extractNode(node.next!, iter - 1);
};

export const mount$ = Block.prototype.mount;
export const patch$ = Block.prototype.patch;
export const move$ = Block.prototype.move;
export const remove$ = Block.prototype.remove;
export const shouldUpdate$ = Block.prototype.shouldUpdate;
