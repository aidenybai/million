import {
  Component,
  createElement,
  forwardRef,
  Fragment,
  memo,
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
} from 'react';
import { createBlock, remove$, mount$, patch$ } from '../million/block';
import { replaceWith$ } from '../million/dom';
import type { Props, VNode } from '../million';
import type {
  FunctionComponent,
  FunctionComponentElement,
  ReactNode,
  RefObject,
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
        const el = mount$.call(currentBlock);
        (marker as any)._cleanup = { marker: marker.current, el };
        replaceWith$.call(marker.current, el);
        patch.current = (props: Props) => {
          patch$.call(currentBlock, block(props));
        };
      }
      return () => remove$.call(currentBlock);
    }, []);

    return createElement(
      Fragment,
      null,
      createElement(Marker, { ref: marker }),
      createElement(Effect, { effect }),
    );
  };
};

const Marker: FunctionComponent<{ ref: RefObject<HTMLDivElement> }> = memo(
  forwardRef((_, ref: any) => {
    useInsertionEffect(() => {
      return () => {
        const { el, marker } = ref._cleanup;
        replaceWith$.call(el, marker);
      };
    }, []);
    return createElement('div', { style: { display: 'none' }, ref });
  }),
  (_, newProps) => !newProps,
);

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
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
function createPortal(arg0: never[], el: any) {
  throw new Error('Function not implemented.');
}
