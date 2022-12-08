import { createElement, patch as patchVNode } from '../million';
import { IS_VOID_ELEMENT } from './constants';
import { cloneNode, insertBefore, setAttribute } from './dom';
import { Block, EditType } from './types';
import type { Edit, EditChild, Props, VElement, VNode } from './types';

class Hole {
  hole: string;
  constructor(hole: string) {
    this.hole = hole;
  }
  toString() {
    // {prop} is okay, but {prop + 'foo'}, {prop + 123}, etc. is not
    throw new Error(`props.${this.hole} cannot be interpolated.`);
  }
}

const holeProxy = new Proxy(
  {},
  {
    // A universal getter will return a Hole instance if props[any] is accessed
    // Allows code to identify holes in virtual nodes
    get(_, prop: string) {
      return new Hole(prop);
    },
  },
);

export const renderToTemplate = (
  vnode?: VNode,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  if (!vnode) return '';
  if (typeof vnode === 'string') return vnode;

  let props = '';
  let children = '';
  const current: Edit = {
    path,
    edits: [],
  };

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'for') name = 'htmlFor';

    if (value instanceof Hole) {
      current.edits.push({
        type: EditType.Attribute,
        hole: value.hole,
        name,
      });
      continue;
    }

    if (!name.startsWith('on')) {
      props += ` ${name}="${String(value)}"`;
    }
  }

  if (IS_VOID_ELEMENT.test(vnode.tag)) return `<${vnode.tag}${props} />`;

  for (let i = 0, j = vnode.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (child instanceof Hole) {
      current.edits.push({
        type: EditType.Child,
        hole: child.hole,
        index: i,
      });
    } else if (child instanceof Block) {
      current.edits.push({
        type: EditType.Block,
        block: child,
        index: i,
      });
    } else {
      children += renderToTemplate(child, edits, [...path, k++]);
    }
  }

  edits.push(current);

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};

export const createBlock = (fn: (props?: Props) => VElement) => {
  const vnode = fn(holeProxy);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  const content = renderToTemplate(vnode, edits, []);
  template.innerHTML = content;

  const getCurrentElement = (current: Edit, root: HTMLElement): HTMLElement => {
    let el = current.el ?? root;
    if (!current.el) {
      for (let k = 0, l = current.path.length; k < l; ++k) {
        el = el.childNodes.item(current.path[k]!) as HTMLElement;
      }
      current.el = el;
    }
    return el;
  };

  class B extends Block {
    constructor(props?: Props | null) {
      super();
      this.props = props;
      this.edits = edits;
      this.key = vnode.key;
    }
    patch(_block: B): HTMLElement {
      return this.el!;
    }
    mount(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
      const clone = cloneNode.call(template.content, true) as DocumentFragment;
      const root = clone.firstChild as HTMLElement;
      this.el = root;
      if (parent) insertBefore.call(parent, root, refNode);

      return root;
    }
    move(block: B | null = null, refNode: Node | null = null) {
      insertBefore.call(
        this.el!.parentElement,
        this.el!,
        block ? block.el! : refNode,
      );
    }
    remove() {
      this.el?.remove();
    }
    toString() {
      return this.el?.outerHTML;
    }
  }

  if (edits.length) {
    B.prototype.mount = function mount(
      parent?: HTMLElement,
      refNode: Node | null = null,
    ): HTMLElement {
      const clone = cloneNode.call(template.content, true) as DocumentFragment;
      const root = clone.firstChild as HTMLElement;

      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          if (edit.type === EditType.Block) continue;
          const value = this.props![edit.hole];
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
          }
          if (edit.type === EditType.Child) {
            if (value instanceof Block) {
              value.mount(el, el.childNodes.item(edit.index));
              continue;
            }
            if (typeof value === 'object' && value.tag) {
              const node = createElement(value);
              insertBefore.call(el, node, el.childNodes.item(edit.index));
            }
            const node = document.createTextNode(String(value));
            if (el.hasChildNodes()) {
              el.insertBefore(
                node,
                edit.index < el.childNodes.length
                  ? el.childNodes.item(edit.index)
                  : el.lastChild,
              );
            } else {
              el.appendChild(node);
            }
          }
        }
      }

      this.el = root;
      if (parent) insertBefore.call(parent, root, refNode);

      return root;
    };

    B.prototype.patch = function patch(block: B): HTMLElement {
      if (this.key && block.key === this.key) return this.el!;
      const root = this.el as HTMLElement;
      if (!block.props) return root;
      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          if (edit.type === EditType.Block) continue;
          const value = block.props[edit.hole];
          if (value === this.props?.[edit.hole]) continue;
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
          }
          if (edit.type === EditType.Child) {
            if (value instanceof Block) {
              const thisEdit = this.edits[i]?.edits[k] as EditChild;
              const thisBlock = this.props?.[thisEdit.hole];
              thisBlock.patch(value);
              continue;
            }

            if (typeof value === 'object' && value.tag) {
              patchVNode(el.childNodes.item(edit.index) as HTMLElement, value);
              continue;
            }
            if (el.childNodes.length === 1) {
              el.textContent = String(value);
              continue;
            }
            const node = document.createTextNode(String(value));
            const child =
              edit.index < el.childNodes.length
                ? el.childNodes.item(edit.index)
                : el.lastChild;

            el.replaceChild(node, child as ChildNode);
          }
        }
      }

      return root;
    };
  }

  return (props?: Props | null) => new B(props);
};

export const patchBlock = (oldBlock: Block, newBlock: Block) => {
  if (!oldBlock.el) oldBlock.mount();
  oldBlock.patch(newBlock);
};
