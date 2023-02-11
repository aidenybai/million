import { IS_VOID_ELEMENT } from './constants';
import {
  setTextContent$,
  childNodes$,
  cloneNode$,
  insertBefore$,
  setAttribute,
  replaceChild$,
  createEventListener,
  remove$,
  insertText,
} from './dom';
import { Block, EditType } from './types';
import type { Edit, EditChild, Props, VElement } from './types';

export class Hole {
  key: string;
  once = false;
  wire?: (props: Props) => any;
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

export const $once = (hole: Hole) => {
  hole.once = true;
};

export const $wire = (
  value: (props: Props) => any,
  keyOrHole?: string | Hole,
) => {
  const cache = new Map();
  const hole = new Hole('');
  const isMemo = keyOrHole !== undefined;
  const isHole = keyOrHole instanceof Hole;
  hole.wire = (props: Props) => {
    const key = isHole ? props[keyOrHole.key] : keyOrHole;
    if (isMemo && cache.has(key)) return cache.get(key);
    const ret = value(props);
    if (isMemo) cache.set(key, ret);
    return ret;
  };
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
      const isValueHole = value instanceof Hole;
      current.edits.push({
        type: EditType.Event,
        listener: value,
        hole: isValueHole ? value : undefined,
        mount(el: HTMLElement, newValue?: any) {
          const event = createEventListener(
            el,
            name,
            isValueHole ? newValue : value,
          );
          event.mount();
          if (isValueHole) {
            this.patch = event.patch;
          }
        },
      });
      continue;
    }

    if (value instanceof Hole) {
      current.edits.push({
        type: EditType.Attribute,
        hole: value,
        mount(el: HTMLElement, newValue: any) {
          setAttribute(el, name, newValue);
        },
        patch(el: HTMLElement, newValue: any) {
          setAttribute(el, name, newValue);
        },
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
        mount(el: HTMLElement, value: any) {
          insertText(el, value, i);
        },
        patch(el: HTMLElement, value: any) {
          const newNode = document.createTextNode(String(value));
          const oldNode = childNodes$.call(el)[i] as HTMLElement;

          replaceChild$.call(el, newNode, oldNode);
        },
      });
      continue;
    }

    if (child instanceof Block) {
      current.edits.push({
        type: EditType.Block,
        mount(el: HTMLElement) {
          child.mount(el, childNodes$.call(el)[i]);
        },
        patch(block: Block) {
          child.patch(block);
        },
      });
      continue;
    }

    if (typeof child === 'string') {
      if (canMergeString) {
        current.inits.push({
          type: EditType.Text,
          mount(el: HTMLElement) {
            insertText(el, child, i);
          },
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

  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }

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
      init.mount(el);
    }
  }

  if (edits.length) {
    ElementBlock.prototype.mount = function mount(
      parent?: HTMLElement,
      refNode: Node | null = null,
    ): HTMLElement {
      const root = cloneNode$.call(firstChild, true) as HTMLElement;

      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root, this.cache, i);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          const value =
            'hole' in edit && edit.hole
              ? edit.hole.wire?.(this.props) ?? this.props![edit.hole.key]
              : undefined;

          if (edit.type === EditType.Child && value instanceof Block) {
            value.mount(el);
            continue;
          }
          if (edit.type === EditType.Event) {
            edit.mount(el, value ?? edit.listener);
            continue;
          }
          edit.mount(el, value);
        }
      }

      this.el = root;
      if (parent) insertBefore$.call(parent, root, refNode);

      return root;
    };

    ElementBlock.prototype.patch = function patch(
      block: ElementBlock,
    ): HTMLElement {
      const root = this.el as HTMLElement;
      if (!block.props) return root;
      const props = this.props;
      this.props = block.props;

      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = getCurrentElement(current, root, this.cache, i);
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          if (edit.type === EditType.Block) {
            edit.patch(block.edits[i]![k].block);
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
          if (edit.type === EditType.Child && oldValue instanceof Block) {
            const firstEdit = block.edits[i]?.edits[k] as EditChild;
            const thisSubBlock = block.props[firstEdit.hole.key];
            oldValue.patch(thisSubBlock);
            continue;
          }
          edit.patch(el, newValue);
        }
      }

      return root;
    };
  }

  return (props?: Props | null, key?: string | null) => {
    return new ElementBlock(props, key ?? props.key);
  };
};

export const fragment = (blocks: Block[]) => {
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
