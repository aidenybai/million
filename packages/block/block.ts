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
} from './dom';
import { renderToTemplate } from './template';
import { AbstractBlock, EditType, Hole } from './types';
import type { Edit, EditChild, Props, VElement } from './types';

export const createBlock = (fn: (props?: Props) => VElement) => {
  let cachedProp: string;
  let cachedHole: Hole;
  const vnode = fn(
    new Proxy(
      {},
      {
        // A universal getter will return a Hole instance if props[any] is accessed
        // Allows code to identify holes in virtual nodes ("digs" them out)
        get(_, prop: string): Hole {
          if (prop === cachedProp) return cachedHole;
          const hole = new Hole(prop);
          cachedProp = prop;
          cachedHole = hole;
          return hole;
        },
      },
    ),
  );
  const edits: Edit[] = [];

  // Turns vnode into a string of HTML and creates an array of "edits"
  // Edits are instructions for how to update the DOM given some props
  const content = renderToTemplate(vnode, edits);
  const template = document.createElement('template');
  innerHTML$.call(template, content);
  const root = template.content.firstChild as HTMLElement;

  // Handles case for positioning text nodes. When text nodes are
  // put into a template, they can be merged. For example,
  // ["hello", "world"] becomes "helloworld" in the DOM.
  // Inserts text nodes into the DOM at the correct position.
  for (let i = 0, j = edits.length; i < j; ++i) {
    const current = edits[i]!;
    if (!current.inits.length) continue;
    const el = getCurrentElement(current, root);
    for (let k = 0, l = current.inits.length; k < l; ++k) {
      const init = current.inits[k]!;
      insertText(el, init.value, init.index);
    }
  }

  return (props?: Props | null, key?: string) => {
    return new Block(root, edits, props, key ?? props?.key);
  };
};

export class Block extends AbstractBlock {
  root: HTMLElement;
  edits: Edit[];
  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string,
  ) {
    super();
    this.root = root;
    this.props = props;
    this.edits = edits;
    // Cache for getCurrentElement()
    this.cache = new Map<number, HTMLElement>();
    this.key = key;
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

        if (edit.type === EditType.Block) {
          edit.block.mount(el, childNodes$.call(el)[edit.index]);
        } else if (edit.type === EditType.Child) {
          if (value instanceof AbstractBlock) {
            value.mount(el);
            continue;
          }
          // insertText() on mount, setText() on patch
          insertText(el, String(value), edit.index);
        } else if (edit.type === EditType.Event) {
          const patch = createEventListener(
            el,
            edit.name,
            // Events can be either a hole or a function
            hasHole ? value : edit.listener,
          );
          if (hasHole) {
            edit.patch = patch;
          }
          continue;
        } else {
          setAttribute(el, edit.name, value);
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
      const el = getCurrentElement(current, root, this.cache, i);
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        if (edit.type === EditType.Block) {
          edit.block.patch(block.edits?.[i]![k].block);
          continue;
        }
        if (!('hole' in edit) || !edit.hole) continue;
        const oldValue = props[edit.hole];
        const newValue = block.props[edit.hole];

        if (newValue === oldValue) continue;

        if (edit.type === EditType.Event) {
          edit.patch?.(newValue);
          continue;
        } else if (edit.type === EditType.Child) {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = block.edits?.[i]?.edits[k] as EditChild;
            const thisSubBlock = block.props[firstEdit.hole];
            oldValue.patch(thisSubBlock);
            continue;
          }
          setText(el, String(newValue), edit.index);
        } else {
          setAttribute(el, edit.name, newValue);
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
  shouldUpdate(oldProps: Props, newProps: Props): boolean {
    for (const i in oldProps) {
      if (oldProps[i] !== newProps[i]) return true;
    }
    return false;
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
  if (!current.path.length) return root;
  if (cache && slot !== undefined && mapHas$.call(cache, slot)) {
    return mapGet$.call(cache, slot)!;
  }
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes root.childNodes[0].childNodes[1].childNodes[2]
  // We use path because we don't have the actual DOM nodes until mount()
  for (let k = 0, l = current.path.length; k < l; ++k) {
    root = childNodes$.call(root)[current.path[k]!] as HTMLElement;
  }
  if (cache && slot !== undefined) mapSet$.call(cache, slot, root);
  return root;
};

export const mount$ = Block.prototype.mount;
export const patch$ = Block.prototype.patch;
export const move$ = Block.prototype.move;
export const remove$ = Block.prototype.remove;
