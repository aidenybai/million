import { createElement, memo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  fragmentMount$,
  fragmentPatch$,
  fragmentRemove$,
} from '../million/fragment';
import { fragment } from '../million';
import type { FunctionComponent, ReactNode } from 'react';

const createChildren = (each: any[], getComponent: any) => {
  const children = Array(each.length);
  for (let i = 0, l = each.length; i < l; ++i) {
    const vnode = getComponent(each[i], i);
    if (vnode.type.__block) {
      children[i] = vnode.type.__block(vnode.props);
    } else {
      throw new Error('<For /> only supports pre-created islands');
    }
  }
  return children;
};

const MillionFragment: FunctionComponent<{
  each: any[];
  children: (value: any, i: number) => ReactNode;
}> = ({ each, children }) => {
  const ref = useRef<HTMLElement>(null);
  const fragmentRef = useRef<ReturnType<typeof fragment> | null>(null);
  if (fragmentRef.current) {
    const newChildren = createChildren(each, children);
    fragmentPatch$.call(fragmentRef.current, fragment(newChildren));
  }
  useEffect(() => {
    fragmentRef.current = fragment(createChildren(each, children));
    fragmentMount$.call(fragmentRef.current, ref.current!);
    return () => {
      fragmentRemove$.call(fragmentRef.current!);
    };
  }, []);

  return createElement('million-fragment', { ref });
};

export const For = memo(MillionFragment, (oldProps, newProps) =>
  Object.is(newProps.each, oldProps.each),
);
