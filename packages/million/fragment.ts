/* eslint-disable @typescript-eslint/unbound-method */
import { mapGet$, mapSet$, setTextContent$ } from './dom';
import { AbstractBlock } from './types';
import { mount$, patch$, move$, remove$ } from './block';

export const fragment = (children: AbstractBlock[], hints?: number[]) => {
  return new FragmentBlock(children, hints);
};

export class FragmentBlock extends AbstractBlock {
  b: AbstractBlock[];
  h?: number[];
  constructor(children: AbstractBlock[], hints?: number[]) {
    super();
    this.b = children;
    this.h = hints;
  }
  v() {
    /**/
  }
  // @ts-expect-error override
  override p(fragment: FragmentBlock) {
    const oldChildren = this.b;
    const newChildren = fragment.b;
    const oldChildrenLength = oldChildren.length;
    const newChildrenLength = newChildren.length;
    const parent = this.t()!;
    if (this === fragment) return;
    if (newChildrenLength === 0 && oldChildrenLength === 0) return;
    if (fragment.h) {
      const hints = fragment.h;
      for (let i = 0, j = hints.length; i < j; ++i) {
        const hint = hints[i]!;
        const oldChild: AbstractBlock | undefined = oldChildren[hint];
        const newChild: AbstractBlock | undefined = newChildren[hint];
        if (oldChild && newChild) {
          patch$.call(oldChild, newChild);
        } else if (oldChild) {
          remove$.call(oldChild.l);
        } else if (newChild) {
          // FIXME: Maybe wrong refNode
          mount$.call(newChild, parent, newChild.l);
        }
      }
      return;
    }

    this.b = newChildren;

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
        oldKeyMap = new Map<string, number>();
        for (let i = oldHead; i <= oldTail; i++) {
          mapSet$.call(oldKeyMap, oldChildren[i]!.k!, i);
        }
      }
      const oldIndex = mapGet$.call(oldKeyMap, newHeadKey);
      if (oldIndex === undefined) {
        mount$.call(newHeadChild, parent, oldHeadChild.l || null);
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
          mount$.call(newChildren[i], parent, nextChild ? nextChild.l : null);
        }
      } else {
        for (let i = oldHead; i <= oldTail; ++i) {
          remove$.call(oldChildren[i]);
        }
      }
    }
    return this._t;
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

export const fragmentMount$ = FragmentBlock.prototype.m;
export const fragmentPatch$ = FragmentBlock.prototype.p;
export const fragmentRemove$ = FragmentBlock.prototype.x;
