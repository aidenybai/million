/* eslint-disable @typescript-eslint/unbound-method */
import { mapGet$, mapSet$, setTextContent$ } from './dom';
import { AbstractBlock } from './types';
import { mount$, patch$, move$, remove$ } from './block';

export const fragment = (children: AbstractBlock[]) => {
  return new FragmentBlock(children);
};

export class FragmentBlock extends AbstractBlock {
  children: AbstractBlock[];
  constructor(children: AbstractBlock[]) {
    super();
    this.children = children;
  }
  move() {
    throw new Error('Cannot move a FragmentBlock');
  }
  // @ts-expect-error - override
  override patch(fragment: FragmentBlock) {
    const oldChildren = this.children;
    const newChildren = fragment.children;
    const oldChildrenLength = oldChildren.length;
    const newChildrenLength = newChildren.length;
    const parent = this.parent!;
    if (this === fragment) return;
    if (newChildrenLength === 0 && oldChildrenLength === 0) return;
    this.children = newChildren;

    if (newChildrenLength === 0) {
      fragmentRemove$.call(this);
      return;
    }
    if (oldChildrenLength === 0) {
      fragmentMount$.call(fragment, parent);
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
        patch$.call(oldHeadChild, newHeadChild);
        newChildren[newHead] = oldHeadChild;
        oldHeadChild = oldChildren[++oldHead];
        newHeadChild = newChildren[++newHead]!;
        continue;
      }

      const oldTailKey = oldTailChild.key!;
      const newTailKey = newTailChild.key!;
      if (oldTailKey === newTailKey) {
        patch$.call(oldTailChild, newTailChild);
        newChildren[newTail] = oldTailChild;
        oldTailChild = oldChildren[--oldTail];
        newTailChild = newChildren[--newTail]!;
        continue;
      }

      if (oldHeadKey === newTailKey) {
        patch$.call(oldHeadChild, newTailChild);
        newChildren[newTail] = oldHeadChild;
        const nextChild = newChildren[newTail + 1];
        move$.call(oldHeadChild, nextChild, nextChild?.el || null);
        oldHeadChild = oldChildren[++oldHead];
        newTailChild = newChildren[--newTail]!;
        continue;
      }

      if (oldTailKey === newHeadKey) {
        patch$.call(oldTailChild, newHeadChild);
        newChildren[newHead] = oldTailChild;
        const nextChild = oldChildren[oldHead];
        move$.call(oldTailChild, nextChild, nextChild?.el || null);
        oldTailChild = oldChildren[--oldTail];
        newHeadChild = newChildren[++newHead]!;
        continue;
      }

      if (!oldKeyMap) {
        oldKeyMap = new Map<string, number>();
        for (let i = oldHead; i <= oldTail; i++) {
          mapSet$.call(oldKeyMap, oldChildren[i]!.key!, i);
        }
      }
      const oldIndex = mapGet$.call(oldKeyMap, newHeadKey);
      if (oldIndex === undefined) {
        mount$.call(newHeadChild, parent, oldHeadChild.el || null);
      } else {
        const oldChild = oldChildren[oldIndex]!;
        move$.call(oldChild, oldHeadChild, null);
        patch$.call(oldChild, newHeadChild);
        newChildren[newHead] = oldChild;
        oldChildren[oldIndex] = null as any;
      }
      newHeadChild = newChildren[++newHead]!;
    }

    if (oldHead <= oldTail || newHead <= newTail) {
      if (oldHead > oldTail) {
        const nextChild = newChildren[newTail + 1];
        for (let i = newHead; i <= newTail; i++) {
          mount$.call(newChildren[i], parent, nextChild ? nextChild.el : null);
        }
      } else {
        for (let i = oldHead; i <= oldTail; ++i) {
          remove$.call(oldChildren[i]);
        }
      }
    }
    return this._parent;
  }
  mount(parent: HTMLElement, refNode: Node | null = null): HTMLElement {
    if (this._parent) return this._parent;
    for (let i = 0, j = this.children.length; i < j; ++i) {
      const block = this.children[i]!;
      mount$.call(block, parent, refNode);
    }
    this._parent = parent;
    return parent;
  }
  remove() {
    const parent = this.parent;
    if (parent) {
      setTextContent$.call(parent, '');
    } else {
      for (let i = 0, j = this.children.length; i < j; ++i) {
        remove$.call(this.children[i]!);
      }
    }
    this.children = [];
  }
  toString() {
    return this.children.map((block) => block.toString()).join('');
  }
  get parent(): HTMLElement | null | undefined {
    if (!this._parent) this._parent = this.children[0]!.parent;
    return this._parent;
  }
}

export const fragmentMount$ = FragmentBlock.prototype.mount;
export const fragmentPatch$ = FragmentBlock.prototype.patch;
export const fragmentRemove$ = FragmentBlock.prototype.remove;
