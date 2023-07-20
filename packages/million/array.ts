/* eslint-disable @typescript-eslint/unbound-method */
import { setTextContent$ } from './dom';
import { AbstractBlock } from './types';
import { mount$, patch$, move$, remove$ } from './block';
import { Map$, MapSet$ } from './constants';

export const mapArray = (children: AbstractBlock[]) => {
  return new ArrayBlock(children);
};

export class ArrayBlock extends AbstractBlock {
  b: AbstractBlock[];
  constructor(children: AbstractBlock[]) {
    super();
    this.b = children;
  }
  v() {
    /**/
  }
  p(fragment: ArrayBlock) {
    const oldChildren: (AbstractBlock | null)[] = this.b;
    const newChildren = fragment.b;
    const oldChildrenLength = oldChildren.length;
    const newChildrenLength = newChildren.length;
    const parent = this.t()!;
    if (this === fragment) return parent;
    if (newChildrenLength === 0 && oldChildrenLength === 0) return parent;

    this.b = newChildren;

    if (newChildrenLength === 0) {
      arrayRemove$.call(this);
      return parent;
    }
    if (oldChildrenLength === 0) {
      arrayMount$.call(fragment, parent);
      return parent;
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

      const oldHeadKey = oldHeadChild.k!;
      const newHeadKey = newHeadChild.k!;
      if (oldHeadKey === newHeadKey) {
        patch$.call(oldHeadChild, newHeadChild);
        newChildren[newHead] = oldHeadChild;
        oldHeadChild = oldChildren[++oldHead];
        newHeadChild = newChildren[++newHead]!;
        continue;
      }

      const oldTailKey = oldTailChild.k!;
      const newTailKey = newTailChild.k!;
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
        move$.call(oldHeadChild, nextChild, nextChild?.l || null);
        oldHeadChild = oldChildren[++oldHead];
        newTailChild = newChildren[--newTail]!;
        continue;
      }

      if (oldTailKey === newHeadKey) {
        patch$.call(oldTailChild, newHeadChild);
        newChildren[newHead] = oldTailChild;
        const nextChild = oldChildren[oldHead];
        move$.call(oldTailChild, nextChild, nextChild?.l || null);
        oldTailChild = oldChildren[--oldTail];
        newHeadChild = newChildren[++newHead]!;
        continue;
      }

      if (!oldKeyMap) {
        oldKeyMap = new Map$<string, number>();
        for (let i = oldHead; i <= oldTail; i++) {
          MapSet$.call(oldKeyMap, oldChildren[i]!.k!, i);
        }
      }
      const oldIndex = oldKeyMap.get(newHeadKey);
      if (oldIndex === undefined) {
        mount$.call(newHeadChild, parent, oldHeadChild.l || null);
      } else {
        const oldChild = oldChildren[oldIndex]!;
        move$.call(oldChild, oldHeadChild, null);
        patch$.call(oldChild, newHeadChild);
        newChildren[newHead] = oldChild;
        oldChildren[oldIndex] = null;
      }
      newHeadChild = newChildren[++newHead]!;
    }

    if (oldHead <= oldTail || newHead <= newTail) {
      if (oldHead > oldTail) {
        const nextChild = newChildren[newTail + 1];
        for (let i = newHead; i <= newTail; ++i) {
          mount$.call(newChildren[i], parent, nextChild ? nextChild.l : null);
        }
      } else {
        for (let i = oldHead; i <= oldTail; ++i) {
          remove$.call(oldChildren[i]);
        }
      }
    }
    return parent;
  }
  m(parent: HTMLElement, refNode: Node | null = null): HTMLElement {
    if (this._t) return this._t;
    for (let i = 0, j = this.b.length; i < j; ++i) {
      const block = this.b[i]!;
      mount$.call(block, parent, refNode);
    }
    this._t = parent;
    return parent;
  }
  x() {
    const parent = this.t();
    if (parent) {
      setTextContent$.call(parent, '');
    } else {
      for (let i = 0, j = this.b.length; i < j; ++i) {
        remove$.call(this.b[i]!);
      }
    }
    this.b = [];
  }
  u(): boolean {
    return true;
  }
  s() {
    return this.b.map((block) => block.s()).join('');
  }
  t(): HTMLElement | null | undefined {
    if (!this._t) this._t = this.b[0]!.t();
    return this._t;
  }
}

const array$ = ArrayBlock.prototype;

export const arrayMount$ = array$.m;
export const arrayPatch$ = array$.p;
export const arrayRemove$ = array$.x;
