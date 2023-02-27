import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
} from 'react';
import { createBlock } from '../million';
import type { AbstractBlock, Props, VNode } from '../million';
import type {
  FunctionComponent,
  FunctionComponentElement,
  ReactNode,
} from 'react';

// TODO: add fragment
export const optimize = (fn: (props: Props) => ReactNode, shouldUpdate) => {
  let block: ReturnType<typeof createBlock> | null = null;
  return (props: Props): FunctionComponentElement<Props> => {
    const ref = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<AbstractBlock | null>(null);

    if (block && instance) {
      startTransition(() => {
        instance.patch(block!(props));
      });
    }

    const effect = useCallback(() => {
      if (!block) block = createBlock(fn as any, unwrap);
      const currentInstance = block(props, props.key, shouldUpdate);
      if (ref.current) {
        currentInstance.mount(ref.current);
        setInstance(currentInstance);
      }
      return () => currentInstance.remove();
    }, []);

    return createElement(
      Fragment,
      null,
      createElement('div', {
        style: { display: 'contents' },
        ref,
      }),
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
