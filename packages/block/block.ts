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
import { fragmentPatch$ } from './fragment';
import type { Edit, EditChild, Props, VElement } from './types';

export const createBlock = (fn: (props?: Props) => VElement) => {
  const cache = new Map<string, Hole>();
  const vnode = fn(
    new Proxy(
      {},
      {
        // A universal getter will return a Hole instance if props[any] is accessed
        // Allows code to identify holes in virtual nodes ("digs" them out)
        get(_, prop: string): Hole {
          if (mapHas$.call(cache, prop)) return mapGet$.call(cache, prop);
          const hole = new Hole(prop);
          mapSet$.call(cache, prop, hole);
          return hole;
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
      let el: HTMLElement | undefined;
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        if (edit.type === EditType.Block) {
          const prototype =
            edit.block instanceof Block ? patch$ : fragmentPatch$;
          // @ts-expect-error - We know this is a block
          prototype.call(edit.block, block.edits?.[i]![k].block);
          continue;
        }
        if (!('hole' in edit) || !edit.hole) continue;
        const oldValue = props[edit.hole];
        const newValue = block.props[edit.hole];

        if (newValue === oldValue) continue;

        if (edit.type === EditType.Event) {
          edit.patch?.(newValue);
          continue;
        }
        if (!el) el = getCurrentElement(current, root, this.cache, i);
        if (edit.type === EditType.Child) {
          if (oldValue instanceof AbstractBlock) {
            // Remember! If we find a block inside a child, we need to locate
            // the cooresponding block in the new props and patch it.
            const firstEdit = block.edits?.[i]?.edits[k] as EditChild;
            const thisSubBlock = block.props[firstEdit.hole];
            const prototype =
              oldValue instanceof Block ? patch$ : fragmentPatch$;
            // @ts-expect-error - We know this is a block
            prototype.call(oldValue, thisSubBlock);
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
  const pathLength = current.path.length;
  if (!pathLength) return root;
  if (cache && slot !== undefined && mapHas$.call(cache, slot)) {
    return mapGet$.call(cache, slot)!;
  }
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes root.childNodes[0].childNodes[1].childNodes[2]
  // We use path because we don't have the actual DOM nodes until mount()
  for (let k = 0; k < pathLength; ++k) {
    root = childNodes$.call(root)[current.path[k]!] as HTMLElement;
  }
  if (cache && slot !== undefined) mapSet$.call(cache, slot, root);
  return root;
};

export const stringToDOM = (content: string) => {
  const template = document.createElement('template');
  innerHTML$.call(template, content);
  return template.content.firstChild as HTMLElement;
};

export const mount$ = Block.prototype.mount;
export const patch$ = Block.prototype.patch;
export const move$ = Block.prototype.move;
export const remove$ = Block.prototype.remove;
