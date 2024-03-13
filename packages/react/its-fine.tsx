// MIT License

// Copyright (c) 2022 Poimandres

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect as uLE,
} from 'react';
import type ReactReconciler from 'react-reconciler';

// avoid hydration errors in server
const useLayoutEffect = typeof window === 'undefined' ? useEffect : uLE;

/**
 * Represents a react-internal Fiber node.
 */
export type Fiber = ReactReconciler.Fiber;

/**
 * Represents a {@link Fiber} node selector for traversal.
 */
export type FiberSelector = (node: Fiber) => boolean | void;

/**
 * Traverses up or down a {@link Fiber}, return `true` to stop and select a node.
 */
export function traverse(
  /** Input {@link Fiber} to traverse. */
  fiber: Fiber,
  /** A {@link Fiber} node selector, returns the first match when `true` is passed. */
  selector: FiberSelector,
  /** Whether to ascend and walk up the tree. Will walk down if `false`. Default is `false`. */
  ascending: boolean,
): Fiber | undefined {
  if (!fiber || selector(fiber)) return fiber;

  let child = ascending ? fiber.return : fiber.child;
  while (child) {
    const match = traverse(child, selector, ascending);
    if (match) return match;

    child = ascending ? null : child.sibling;
  }
}

/**
 * Returns the current react-internal {@link Fiber}. This is an implementation detail of [react-reconciler](https://github.com/facebook/react/tree/main/packages/react-reconciler).
 */
export function useFiber(): Fiber {
  const fiber = useRef<Fiber>();

  useState(() => {
    const bind = Function.prototype.bind;
    Function.prototype.bind = function (self, maybeFiber) {
      if (self === null && typeof maybeFiber?.type === 'function') {
        fiber.current = maybeFiber;
        Function.prototype.bind = bind;
      }
      return bind.apply(this, arguments as any);
    };
  });

  return fiber.current!;
}

/**
 * Returns the nearest react-reconciler parent instance or the node created from {@link ReactReconciler.HostConfig.createInstance}.
 *
 * In react-dom, this would be a DOM element; in react-three-fiber this would be an instance descriptor.
 */
export function useNearestParent<
  T extends any,
  B extends { el: T; depth: number } = { el: T; depth: number },
>(
  /** An optional element type to filter to. */
  type?: keyof JSX.IntrinsicElements,
): React.MutableRefObject<B | undefined> {
  const fiber = useFiber();
  const parentRef = useRef<B>({ el: null as any, depth: 0 } as B);

  useLayoutEffect(() => {
    parentRef.current.el = traverse(
      fiber,
      (node) => {
        parentRef.current.depth++;

        return (
          typeof node.type === 'string' &&
          (type === undefined || node.type === type)
        );
      },
      true,
    )?.stateNode;
  }, [fiber]);

  return parentRef;
}

/**
 * Returns the current react-reconciler container info passed to {@link ReactReconciler.Reconciler.createContainer}.
 *
 * In react-dom, a container will point to the root DOM element; in react-three-fiber, it will point to the root Zustand store.
 */
export function useContainer<
  T extends any,
  B extends { el: T; depth: number } = { el: T; depth: number },
>(): React.MutableRefObject<B | undefined> {
  const fiber = useFiber();
  const rootRef = useRef<B>({ el: null as any, depth: 0 } as B);

  useLayoutEffect(() => {
    rootRef.current.el = traverse(
      fiber,
      (node) => {
        rootRef.current.depth++;
        return node.stateNode?.containerInfo != null;
      },
      true,
    )?.stateNode.containerInfo;
  }, [fiber]);

  return rootRef;
}

export function useNearestParentFiber(
  /** An optional element type to filter to. */
  type?: keyof JSX.IntrinsicElements,
): Fiber {
  const fiber = useFiber();
  const parentRef = useRef<Fiber>();

  useState(() => {
    parentRef.current = traverse(
      fiber,
      (node) =>
        typeof node.type === 'string' &&
        (type === undefined || node.type === type),
      true,
    );
  });

  return parentRef.current!;
}
