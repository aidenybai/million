import { createElement, Fragment, useCallback, useEffect, useRef } from 'react';
import { createBlock, remove$, mount$, patch$ } from '../million/block';
import type { Props, VNode } from '../million';
import type {
  FunctionComponent,
  FunctionComponentElement,
  ReactNode,
} from 'react';

export const optimize = (
  fn: (props: Props) => ReactNode,
  shouldUpdate: (oldProps: Props, newProps: Props) => boolean,
) => {
  const block = createBlock(fn as any, unwrap);
  return (props: Props): FunctionComponentElement<Props> => {
    const marker = useRef<HTMLDivElement>(null);
    const patch = useRef<((props: Props) => void) | null>(null);

    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key, shouldUpdate);
      if (marker.current) {
        mount$.call(
          currentBlock,
          marker.current.parentElement!,
          marker.current,
        );
        patch.current = (props: Props) => {
          patch$.call(currentBlock, block(props));
        };
      }
      return () => remove$.call(currentBlock);
    }, []);

    return createElement(
      Fragment,
      null,
      patch.current ? null : createElement('div', { ref: marker }),
      createElement(Effect, { effect }),
    );
  };
};

export const unwrap = (vnode: ReactNode): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    return vnode as VNode;
  }
  if (typeof vnode.type === 'function') {
    throw new Error('Cannot have components in children');
  }
  const props = { ...vnode.props };
  if (vnode.props?.children) {
    props.children = flatten<ReactNode>(vnode.props.children).map((child) =>
      unwrap(child),
    );
  }
  return {
    type: vnode.type,
    props,
  };
};

export const flatten = <T>(rawChildren: T): T[] => {
  if (rawChildren === undefined || rawChildren === null) return [];
  if (!Array.isArray(rawChildren) || (('__key' in rawChildren) as any))
    return [rawChildren];
  const flattenedChildren = rawChildren.flat(Infinity);
  const children: T[] = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten<T>(flattenedChildren[i] as any));
  }
  return children;
};

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
