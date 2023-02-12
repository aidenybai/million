import { compileTemplate } from './compiler';
import {
  childNodes$,
  cloneNode$,
  createEventListener,
  getCurrentElement,
  insertBefore$,
  insertText,
  setAttribute,
  setText,
  remove$ as removeElement$,
} from './dom';
import type { Edit, EditChild, Props, VElement } from './types';
import { Block, EditType, Hole } from './types';

class ElementBlock extends Block {
  constructor(
    root: HTMLElement,
    edits: Edit[],
    props?: Props | null,
    key?: string | null,
  ) {
    super();
    this.root = root;
    this.props = props;
    this.edits = edits;
    this.cache = new Map<number, HTMLElement>();
    this.key = key;
  }
  mount(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
    const root = cloneNode$.call(this.root, true) as HTMLElement;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      const el = getCurrentElement(current, root, this.cache, i);
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const hasHole = 'hole' in edit && edit.hole;
        const value = hasHole
          ? edit.hole.wire?.(this.props) ?? this.props![edit.hole.key]
          : undefined;

        if (edit.type === EditType.Block) {
          edit.block.mount(el, childNodes$.call(el)[edit.index]);
        }
        if (edit.type === EditType.Child) {
          if (value instanceof Block) {
            value.mount(el);
            continue;
          }

          insertText(el, String(value), edit.index);
        }
        if (edit.type === EditType.Event) {
          const event = createEventListener(
            el,
            edit.name,
            hasHole ? value : edit.listener,
          );
          event.mount();
          if (hasHole) {
            edit.patch = event.patch;
          }
          continue;
        }
        if (edit.type === EditType.Attribute) {
          setAttribute(el, edit.name, value);
        }
      }
    }

    this.el = root;
    if (parent) insertBefore$.call(parent, root, refNode);

    return root;
  }
  patch(block: ElementBlock): HTMLElement {
    const root = this.el as HTMLElement;
    if (!block.props) return root;
    const props = this.props;
    this.props = block.props;

    for (let i = 0, j = this.edits.length; i < j; ++i) {
      const current = this.edits[i]!;
      const el = getCurrentElement(current, root, this.cache, i);
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        if (edit.type === EditType.Block) {
          edit.block.patch(block.edits[i]![k].block);
          continue;
        }
        if (!('hole' in edit) || !edit.hole) continue;
        const oldValue = edit.hole.wire?.(props) ?? props[edit.hole.key];
        const newValue =
          edit.hole.wire?.(block.props) ?? block.props[edit.hole.key];

        if (edit.hole && (newValue === oldValue || edit.hole.once)) continue;

        if (edit.type === EditType.Event) {
          edit.patch?.(newValue);
          continue;
        }
        if (edit.type === EditType.Attribute) {
          setAttribute(el, edit.name, newValue);
        }
        if (edit.type === EditType.Child) {
          if (oldValue instanceof Block) {
            const firstEdit = block.edits[i]?.edits[k] as EditChild;
            const thisSubBlock = block.props[firstEdit.hole.key];
            oldValue.patch(thisSubBlock);
            continue;
          }
          setText(el, String(newValue), edit.index);
        }
      }
    }

    return root;
  }
  move(block: ElementBlock | null = null, refNode: Node | null = null) {
    insertBefore$.call(this.parent, this.el!, block ? block.el! : refNode);
  }
  remove() {
    removeElement$.call(this.el);
  }
  toString() {
    return this.el?.outerHTML;
  }
  get parent(): HTMLElement | null | undefined {
    if (!this._parent) this._parent = this.el?.parentElement;
    return this._parent;
  }
}

export const createBlock = (
  fn: (props?: Props, children?: Block[]) => VElement,
) => {
  const holeCache = new Map();
  const HOLE_PROXY = new Proxy(
    {},
    {
      // A universal getter will return a Hole instance if props[any] is accessed
      // Allows code to identify holes in virtual nodes
      get(_, prop: string) {
        if (holeCache.has(prop)) return holeCache.get(prop);
        const hole = new Hole(prop);
        holeCache.set(prop, hole);
        return hole;
      },
    },
  );
  const vnode = fn(HOLE_PROXY);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  const content = compileTemplate(vnode, edits);
  template.innerHTML = content;
  const root = template.content.firstChild as HTMLElement;

  for (let i = 0, j = edits.length; i < j; ++i) {
    const current = edits[i]!;
    const el = getCurrentElement(current, root);
    for (let k = 0, l = current.inits.length; k < l; ++k) {
      const init = current.inits[k]!;
      if (init.type === EditType.Text) {
        insertText(el, init.value, init.index);
      }
    }
  }

  return (props?: Props | null, key?: string | null) => {
    return new ElementBlock(root, edits, props, key ?? props.key);
  };
};

export const mount$ = ElementBlock.prototype.mount;
export const patch$ = ElementBlock.prototype.patch;
export const move$ = ElementBlock.prototype.move;
export const remove$ = ElementBlock.prototype.remove;
