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
  mapGet$,
  mapHas$,
  mapSet$,
  setStyleAttribute,
  setSvgAttribute,
  firstChild$,
  nextSibling$,
} from './dom';
import { renderToTemplate } from './template';
import { AbstractBlock } from './types';
import type { Edit, EditChild, Props, VElement, Hole } from './types';

export const createBlock = (fn: (props?: Props) => VElement) => {
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
  const root = stringToDOM(renderToTemplate(vnode, edits));

  // Handles case for positioning text nodes. When text nodes are
  // put into a template, they can be merged. For example,
  // ["hello", "world"] becomes "helloworld" in the DOM.
  // Inserts text nodes into the DOM at the correct position.
  for (let i = 0, j = edits.length; i < j; ++i) {
    const current = edits[i]!;
    const initsLength = current.inits.length;
    if (!initsLength) continue;
    const el = getCurrentElement(current, root);
    for (let k = 0; k < initsLength; ++k) {
      const init = current.inits[k]!;
      insertText(el, init.value, init.index);
    }
  }

  return (
    props?: Props | null,
    key?: string,
    shouldUpdate?: (oldProps: Props, newProps: Props) => boolean,
  ) => {
    return new Block(root, edits, props, key ?? props?.key, shouldUpdate);
  };
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
      const el = getCurrentElement(current, root, this.cache, i);
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const hasHole = 'hole' in edit && edit.hole;
        const value = hasHole ? this.props![edit.hole!] : undefined;

        if (edit.type === 'block') {
          edit.block.mount(el, childNodes$.call(el)[edit.index]);
        } else if (edit.type === 'child') {
          if (value instanceof AbstractBlock) {
            value.mount(el);
            continue;
          }
          // insertText() on mount, setText() on patch
          insertText(el, String(value), edit.index);
        } else if (edit.type === 'event') {
          const patch = createEventListener(
            el,
            edit.name,
            // Events can be either a hole or a function
            hasHole ? value : edit.listener,
          );
          if (hasHole) {
            edit.patch = patch;
          }
        } else if (edit.type === 'attribute') {
          setAttribute(el, edit.name, value);
        } else if (edit.type === 'style') {
          setStyleAttribute(el, edit.name, value);
        } else {
          setSvgAttribute(el, edit.name, value);
        }
      }
    }

    this.el = root;
    if (parent) insertBefore$.call(parent, root, refNode);

    return root;
  }
  patch(block: AbstractBlock): HTMLElement {
    const root = this.el as HTMLElement;
    if (!block.props) return root;
    const props = this.props!;
    // If props are the same, no need to patch
    if (!this.shouldUpdate(props, block.props)) return root;
    this.props = block.props;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      let el: HTMLElement | undefined;
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        if (edit.type === 'block') {
          edit.block.patch(block.edits?.[i]![k].block);
          continue;
        }
        if (!('hole' in edit) || !edit.hole) continue;
        const oldValue = props[edit.hole];
        const newValue = block.props[edit.hole];

        if (Object.is(newValue, oldValue)) continue;

        if (edit.type === 'event') {
          edit.patch?.(newValue);
          continue;
        }
        if (!el) el = getCurrentElement(current, root, this.cache, i);
        if (edit.type === 'child') {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = block.edits?.[i]?.edits[k] as EditChild;
            const thisSubBlock = block.props[firstEdit.hole];
            oldValue.patch(thisSubBlock);
            continue;
          }
          setText(el, String(newValue), edit.index);
        } else if (edit.type === 'attribute') {
          setAttribute(el, edit.name, newValue);
        } else if (edit.type === 'style') {
          setStyleAttribute(el, edit.name, newValue);
        } else {
          setSvgAttribute(el, edit.name, newValue);
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
  }
  shouldUpdate(_oldProps: Props, _newProps: Props): boolean {
    return true;
  }
  toString() {
    return String(this.el?.outerHTML);
  }
  get parent(): HTMLElement | null | undefined {
    if (!this._parent) this._parent = this.el?.parentElement;
    return this._parent;
  }
}

const getCurrentElement = (
  current: Edit,
  root: HTMLElement,
  cache?: Map<number, HTMLElement>,
  slot?: number, // edit index
): HTMLElement => {
  const pathLength = current.path.length;
  if (!pathLength) return root;
  if (cache && slot !== undefined && mapHas$.call(cache, slot)) {
    return mapGet$.call(cache, slot)!;
  }
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes:
  // root.firstChild.firstChild.nextSibling.firstChild.nextSibling.nextSibling
  // We use path because we don't have the actual DOM nodes until mount()
  for (let i = 0; i < pathLength; ++i) {
    const siblings = current.path[i]!;
    // https://www.measurethat.net/Benchmarks/Show/15652/0/childnodes-vs-children-vs-firstchildnextsibling-vs-firs
    root = firstChild$.call(root);
    if (!siblings) continue;
    for (let j = 0; j < siblings; ++j) {
      root = nextSibling$.call(root) as HTMLElement;
    }
  }
  if (cache && slot !== undefined) mapSet$.call(cache, slot, root);
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
