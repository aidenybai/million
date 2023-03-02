import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createBlock, mount$, patch$, remove$ } from '../million/block';
import type {
  FunctionComponent,
  FunctionComponentElement,
  ReactNode,
} from 'react';
import type { Props, VNode } from '../million';

interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
  mode: 'raw' | 'island';
}

export const optimize = (
  fn: (props: Props) => ReactNode,
  options: Options = { mode: 'raw' },
) => {
  const block = createBlock(fn as any, unwrap);
  const specialProps: Record<string, ReturnType<typeof createBlock>> = {};
  const component = (rawProps: Props): FunctionComponentElement<Props> => {
    const ref = useRef<HTMLDivElement>(null);
    const patch = useRef<((props: Props) => void) | null>(null);

    const props = { ...rawProps };

    for (const prop in props) {
      const vnode = props[prop];
      if (typeof vnode === 'object' && vnode !== null) {
        if (!(prop in specialProps)) {
          const vnodeBlock = createBlock(() => props[prop], unwrap) as any;
          specialProps[prop] = vnodeBlock;
        }
      }
      if (prop in specialProps) {
        props[prop] = specialProps[prop]!(vnode.props);
      }
    }

    patch.current?.(props);

    const effect = useCallback(() => {
      const currentBlock = block(props, props.key, options.shouldUpdate);
      if (ref.current) {
        mount$.call(currentBlock, ref.current, null, options.mode === 'raw');
        patch.current = (props: Props) => {
          patch$.call(currentBlock, block(props));
        };
      }
      return () => {
        if (options.mode === 'island') remove$.call(currentBlock);
      };
    }, []);

    const marker = useMemo(() => {
      if (options.mode === 'island') {
        return createElement('div', { ref, style: { display: 'contents' } });
      }
      const vnode = fn(props);
      if (
        typeof vnode === 'object' &&
        vnode !== null &&
        'type' in vnode &&
        vnode.props?.children
      ) {
        const { type, props, key } = vnode;
        const newProps = { key, ref };
        for (const prop in props) {
          if (prop !== 'children') {
            newProps[prop] = props[prop];
          }
        }
        return createElement(type, newProps);
      }
    }, []);

    return createElement(
      Fragment,
      null,
      marker,
      createElement(Effect, { effect }),
    );
  };
  component._block = block;
  return component;
};

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};

export const unwrap = (vnode: ReactNode): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    return vnode as VNode;
  }
  if (typeof vnode.type === 'function') {
    const type = vnode.type as any;
    return unwrap(type(vnode.props));
  }
  const props = { ...vnode.props };
  if (vnode.props?.children) {
    props.children = flatten<ReactNode>(vnode.props.children).map((child) =>
      unwrap(child),
    );
  }
  return {
    type: vnode.type, // lets pretend no function go through
    props,
  };
};

export const flatten = <T>(rawChildren: T): T[] => {
  console.log(rawChildren === 0);
  if (rawChildren === undefined || rawChildren === null) return [];
  if (!Array.isArray(rawChildren) || (('__key' in rawChildren) as any)) {
    return [rawChildren];
  }
  const flattenedChildren = rawChildren.flat(Infinity);
  const children: T[] = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten<T>(flattenedChildren[i] as any));
  }
  return children;
};
