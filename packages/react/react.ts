import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
  return (rawProps: Props): FunctionComponentElement<Props> => {
    const ref = useRef<HTMLDivElement>(null);
    const portal = useRef({});
    const [main, setMain] = useState<AbstractBlock | null>(null);
    const wrappedProps = useMemo(() => {
      const props = {};
      for (const key in rawProps) {
        if (isVNode(props[key])) {
          const factory = portal[key]
            ? portal[key].containerInfo.parentElement
            : document.createElement('span');
          portal[key] = createPortal(props[key], factory);
          return factory;
        }
        delete portal.current[key];
        props[key] = rawProps[key];
      }
      return props;
    }, [rawProps]);

    if (block && main) main.patch(block(wrappedProps));

    const effect = useCallback(() => {
      block = createBlock(fn as any, unwrap);
      const main = block(wrappedProps, wrappedProps.key, shouldUpdate);
      if (ref.current) {
        main.mount(ref.current);
        setMain(main);
      }
      return () => main.remove();
    }, []);

    return createElement(
      Fragment,
      null,
      createElement('div', { style: { display: 'contents' }, ref }),
      createElement(Effect, { effect }),
      Object.values(portal.current),
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

const isVNode = (value: unknown) => {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.some(isVNode);
    } else if ('_owner' in value) {
      return true;
    }
  }
  return false;
};

const Effect: FunctionComponent<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
