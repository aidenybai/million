import { createElement, patch as patchVNode } from '../million';
import { IS_VOID_ELEMENT } from './constants';
import {
  setTextContent$,
  childNodes$,
  cloneNode$,
  insertBefore$,
  setAttribute,
  createEventListener,
  remove$,
  insertText,
} from './dom';
import { Block, EditType } from './types';
import type { Edit, EditChild, Props, VElement } from './types';

export class Hole {
  key: string;
  once = false;
  wire?: (value: any) => any;
  constructor(key: string) {
    this.key = key;
  }
}

const HOLE_PROXY = new Proxy(
  {},
  {
    // A universal getter will return a Hole instance if props[any] is accessed
    // Allows code to identify holes in virtual nodes
    get(_, prop: string) {
      return new Hole(prop);
    },
  },
);

export const once = (hole: Hole) => {
  hole.once = true;
};

export const wire = (value: (v: any) => any) => {
  const hole = new Hole('');
  hole.wire = value;
  return hole;
};

/**
 * TODO: revamp compile by flattening edits - cretes [hole, updateFunction(el, data... etc.)]
 */
export const compileTemplate = (
  vnode: VElement,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  let props = '';
  let children = '';
  const current: Edit = {
    path,
    edits: [],
    inits: [],
  };

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'for') name = 'htmlFor';

    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (name[0] === 'o' && name[1] === 'n') {
      current[value instanceof Hole ? 'edits' : 'inits'].push({
        type: EditType.Event,
        listener: value,
        hole: value,
        name,
      });
      continue;
    }

    if (value instanceof Hole) {
      current.edits.push({
        type: EditType.Attribute,
        hole: value,
        name,
      });
      continue;
    }

    if (value) props += ` ${name}="${String(value)}"`;
  }

  if (IS_VOID_ELEMENT.test(vnode.tag)) return `<${vnode.tag}${props} />`;

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (!child) continue;

    if (child instanceof Hole) {
      current.edits.push({
        type: EditType.Child,
        hole: child,
        index: i,
      });
      continue;
    }

    if (child instanceof Block) {
      current.edits.push({
        type: EditType.Block,
        block: child,
        index: i,
      });
      continue;
    }

    if (typeof child === 'string') {
      if (canMergeString) {
        current.inits.push({
          type: EditType.Text,
          index: i,
          value: child,
        });
        continue;
      }
      canMergeString = true;
      children += child;
      k++;
      continue;
    }

    canMergeString = false;
    children += compileTemplate(child, edits, [...path, k++]);
  }

  if (current.edits.length) edits.push(current);

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};

export const createBlock = (
  fn: (props?: Props, children?: Block[]) => VElement,
) => {
  const vnode = fn(HOLE_PROXY);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  const content = compileTemplate(vnode, edits);
  template.innerHTML = content;
  const firstChild = template.content.firstChild as HTMLElement;

  const getCurrentElement = (
    current: Edit,
    root: HTMLElement,
    cache?: Map<number, HTMLElement>,
    slot?: number,
  ): HTMLElement => {
    if (cache && slot && cache.has(slot)) return cache.get(slot)!;
    for (let k = 0, l = current.path.length; k < l; ++k) {
      root = childNodes$.call(root)[current.path[k]!] as HTMLElement;
    }
    if (cache && slot) cache.set(slot, root);
    return root;
  };

  class ElementBlock extends Block {
    edits: Edit[];
    constructor(props?: Props | null, key?: string | null) {
      super();
      this.props = props;
      this.edits = edits;
      this.cache = new Map<number, HTMLElement>();
      this.key = key || vnode.key;
    }
    patch(_block: ElementBlock): HTMLElement {
      return this.el!;
    }
    mount(parent?: HTMLElement, refNode: Node | null = null): HTMLElement {
      const root = cloneNode$.call(firstChild, true) as HTMLElement;
      this.el = root;
      this._parent = parent;
      if (parent) insertBefore$.call(parent, root, refNode);

      return root;
    }
    move(block: ElementBlock | null = null, refNode: Node | null = null) {
      insertBefore$.call(this.parent, this.el!, block ? block.el! : refNode);
    }
    remove() {
      remove$.call(this.el);
    }
    toString() {
      return this.el?.outerHTML;
    }
    get parent(): HTMLElement | null | undefined {
      if (!this._parent) this._parent = this.el?.parentElement;
      return this._parent;
    }
  }

  for (let i = 0, j = edits.length; i < j; ++i) {
    const current = edits[i]!;
    const el = getCurrentElement(current, firstChild);
    for (let k = 0, l = current.inits.length; k < l; ++k) {
      const init = current.inits[k]!;
      if (init.type === EditType.Text) {
        insertText(el, init.value, init.index);
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (init.type === EditType.Event) {
        createEventListener(el, init.name, init.listener).mount();
        continue;
      }
    }
  }

  if (edits.length) {
    ElementBlock.prototype.mount = function mount(
      parent?: HTMLElement,
      refNode: Node | null = null,
    ): HTMLElement {
      const root = cloneNode$.call(firstChild, true) as HTMLElement;

      // TODO: flatten to array
      // have a this.accumulator and push [hole, updateFunction()] to it instead of searching edits each time.
      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root, this.cache, i);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          if (edit.type === EditType.Block) {
            edit.block.mount(el, childNodes$.call(el)[edit.index]);
            continue;
          }
          const value = edit.hole
            ? edit.hole.wire?.(this.props) ?? this.props![edit.hole.key]
            : undefined;
          if (edit.type === EditType.Event) {
            const event = createEventListener(
              el,
              edit.name,
              value ?? edit.listener,
            );
            event.mount();
            edit.patch = event.patch;
            continue;
          }
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
            continue;
          }

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (edit.type === EditType.Child) {
            if (value instanceof Block) {
              value.mount(el, childNodes$.call(el)[edit.index]);
              continue;
            }
            if (typeof value === 'object' && value.tag) {
              const node = createElement(value);
              insertBefore$.call(el, node, childNodes$.call(el)[edit.index]!);
            }
            insertText(el, value, edit.index);
          }
        }
      }

      this.el = root;
      if (parent) insertBefore$.call(parent, root, refNode);

      return root;
    };

    // TODO: flatten to array
    // use this.accumulator and push [hole, updateFunction()] to it instead of searching edits each time.
    ElementBlock.prototype.patch = function patch(
      block: ElementBlock,
    ): HTMLElement {
      const root = this.el as HTMLElement;
      if (!block.props) return root;

      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root, this.cache, i);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          if (edit.type === EditType.Block) {
            edit.block.patch(block.edits[i]![k].block);
            continue;
          }
          const value = edit.hole
            ? edit.hole.wire?.(this.props) ?? this.props![edit.hole.key]
            : undefined;

          if (
            edit.hole &&
            (value === this.props?.[edit.hole.key] || edit.hole.once)
          )
            continue;
          if (edit.type === EditType.Event) {
            edit.patch?.(value);
            continue;
          }
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
          }
          if (edit.type === EditType.Child) {
            if (value instanceof Block) {
              const firstEdit = this.edits[i]?.edits[k] as EditChild;
              const thisSubBlock = this.props?.[firstEdit.hole.key];
              thisSubBlock.patch(value);

              continue;
            }

            if (typeof value === 'object' && value.tag) {
              patchVNode(
                childNodes$.call(el)[edit.index] as HTMLElement,
                value,
              );
              continue;
            }
            const node = document.createTextNode(String(value));
            const child = childNodes$.call(el)[edit.index]!;

            el.replaceChild(node, child);
          }
        }
      }

      return root;
    };
  }

  return (props?: Props | null, key?: string | null) => {
    return new ElementBlock(props, key);
  };
};

export const patchBlock = (oldBlock: Block, newBlock: Block) => {
  oldBlock.patch(newBlock);
};

export const fragmentBlock = (blocks: Block[]) => {
  class FragmentBlock extends Block {
    children: Block[];
    constructor() {
      super();
      this.children = blocks;
    }
    patch(fragment: FragmentBlock) {
      const oldChildren = this.children;
      const newChildren = fragment.children;
      const oldChildrenLength = oldChildren.length;
      const newChildrenLength = newChildren.length;
      const parent = this.parent!;
      if (this === fragment) return;
      if (newChildrenLength === 0 && oldChildrenLength === 0) return;
      this.children = newChildren;

      if (newChildrenLength === 0) {
        this.remove();
        return;
      }
      if (oldChildrenLength === 0) {
        fragment.mount(parent);
        return;
      }

      let oldHead = 0;
      let newHead = 0;
      let oldTail = oldChildrenLength - 1;
      let newTail = newChildrenLength - 1;

      let oldHeadChild = oldChildren[0];
      let newHeadChild = newChildren[0]!;
      let oldTailChild = oldChildren[oldTail];
      let newTailChild = newChildren[newTail]!;

      let oldKeyMap: Map<string, number> | undefined;

      while (oldHead <= oldTail && newHead <= newTail) {
        if (!oldHeadChild) {
          oldHeadChild = oldChildren[++oldHead];
          continue;
        }
        if (!oldTailChild) {
          oldTailChild = oldChildren[--oldTail];
          continue;
        }

        const oldHeadKey = oldHeadChild.key!;
        const newHeadKey = newHeadChild.key!;
        if (oldHeadKey === newHeadKey) {
          oldHeadChild.patch(newHeadChild);
          newChildren[newHead] = oldHeadChild;
          oldHeadChild = oldChildren[++oldHead];
          newHeadChild = newChildren[++newHead]!;
          continue;
        }

        const oldTailKey = oldTailChild.key!;
        const newTailKey = newTailChild.key!;
        if (oldTailKey === newTailKey) {
          oldTailChild.patch(newTailChild);
          newChildren[newTail] = oldTailChild;
          oldTailChild = oldChildren[--oldTail];
          newTailChild = newChildren[--newTail]!;
          continue;
        }

        if (oldHeadKey === newTailKey) {
          oldHeadChild.patch(newTailChild);
          newChildren[newTail] = oldHeadChild;
          const nextChild = newChildren[newTail + 1];
          oldHeadChild.move(nextChild, nextChild?.el || null);
          oldHeadChild = oldChildren[++oldHead];
          newTailChild = newChildren[--newTail]!;
          continue;
        }

        if (oldTailKey === newHeadKey) {
          oldTailChild.patch(newHeadChild);
          newChildren[newHead] = oldTailChild;
          const nextChild = oldChildren[oldHead];
          oldTailChild.move(nextChild, nextChild?.el || null);
          oldTailChild = oldChildren[--oldTail];
          newHeadChild = newChildren[++newHead]!;
          continue;
        }

        if (!oldKeyMap) {
          oldKeyMap = new Map<string, number>();
          for (let i = oldHead; i <= oldTail; i++) {
            oldKeyMap.set(oldChildren[i]!.key!, i);
          }
        }
        const oldIndex = oldKeyMap.get(newHeadKey);
        if (oldIndex === undefined) {
          newHeadChild.mount(parent, oldHeadChild.el || null);
        } else {
          const oldChild = oldChildren[oldIndex]!;
          oldChild.move(oldHeadChild, null);
          oldChild.patch(newHeadChild);
          newChildren[newHead] = oldChild;
          oldChildren[oldIndex] = null as any;
        }
        newHeadChild = newChildren[++newHead]!;
      }

      if (oldHead <= oldTail || newHead <= newTail) {
        if (oldHead > oldTail) {
          const nextChild = newChildren[newTail + 1];
          for (let i = newHead; i <= newTail; i++) {
            newChildren[i]!.mount(parent, nextChild ? nextChild.el : null);
          }
        } else {
          for (let i = oldHead; i <= oldTail; ++i) {
            oldChildren[i]?.remove();
          }
        }
      }
    }
    mount(parent: HTMLElement, refNode: Node | null = null) {
      for (let i = 0, j = this.children.length; i < j; ++i) {
        const block = this.children[i]!;
        block.mount(parent, refNode);
      }
      this._parent = parent;
    }
    remove() {
      const parent = this.parent;
      if (parent) {
        setTextContent$.call(parent, '');
      } else {
        for (let i = 0, j = this.children.length; i < j; ++i) {
          this.children[i]!.remove();
        }
      }
    }
    toString() {
      return this.children.map((block) => block.toString()).join('');
    }
    get parent(): HTMLElement | null | undefined {
      if (!this._parent) this._parent = this.children[0]!.parent;
      return this._parent;
    }
  }
  return new FragmentBlock();
};
