import { className, kebab, m, style, svg } from '../million/m';
import { Delta, Flags, VElementFlags, VNode, VProps } from '../million/types';
import { RawVNode } from './types';

export const normalize = (rawVNode: RawVNode): VNode | VNode[] | undefined => {
  if (Array.isArray(rawVNode)) {
    const normalizedChildren: VNode[] = [];
    for (let i = 0; i < rawVNode.length; i++) {
      normalizedChildren.push(normalize(rawVNode[i]) as VNode);
    }
    return normalizedChildren;
  } else if (
    typeof rawVNode === 'string' ||
    typeof rawVNode === 'number' ||
    typeof rawVNode === 'boolean'
  ) {
    return String(rawVNode);
  } else {
    return rawVNode as VNode;
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const h = (tag: string | Function, props?: VProps, ...children: RawVNode[]) => {
  if (typeof tag === 'function') return tag(props, props?.key);

  let flag: VElementFlags = Flags.ELEMENT_NO_CHILDREN;
  let delta: Delta[] | undefined;
  const normalizedChildren: VNode[] = [];
  if (props) {
    const rawDelta = props.delta as Delta[];
    if (rawDelta && rawDelta.length) {
      delta = rawDelta;
      props.delta = undefined;
    }
  }
  if (children) {
    const keysInChildren = new Set();
    let hasVElementChildren = false;
    flag = Flags.ELEMENT;

    if (children.every((child) => typeof child === 'string')) {
      flag = Flags.ELEMENT_TEXT_CHILDREN;
    }
    let childrenLength = 0;
    for (let i = 0; i < children.length; ++i) {
      if (
        children[i] !== undefined &&
        children[i] !== null &&
        children[i] !== false &&
        children[i] !== ''
      ) {
        const unwrappedChild = normalize(children[i]) as VNode;
        const subChildren = Array.isArray(unwrappedChild)
          ? ((childrenLength += unwrappedChild.length), unwrappedChild)
          : (childrenLength++, [unwrappedChild]);

        for (let i = 0; i < subChildren.length; i++) {
          if (subChildren[i] || subChildren[i] === '') {
            normalizedChildren.push(subChildren[i]);
            if (typeof subChildren[i] === 'object') {
              hasVElementChildren = true;
              if (typeof subChildren[i].key === 'string' && subChildren[i].key !== '') {
                keysInChildren.add(subChildren[i].key);
              }
            }
          }
        }
      }
    }
    if (keysInChildren.size === childrenLength) {
      flag = Flags.ELEMENT_KEYED_CHILDREN;
    }
    if (!hasVElementChildren) {
      flag = Flags.ELEMENT_TEXT_CHILDREN;
    }
  }
  if (props) {
    if (typeof props.flag === 'number') {
      flag = props.flag;
      props.flag = undefined;
    }
    if (typeof props.className === 'object') {
      props.className = className(props.className as Record<string, boolean>);
    }
    if (typeof props.style === 'object') {
      const rawStyle = props.style as Record<string, string>;
      const normalizedStyle = Object.keys(rawStyle).some((key) => /[-A-Z]/gim.test(key))
        ? kebab(rawStyle)
        : rawStyle;
      props.style = style(normalizedStyle as Record<string, string>);
    }
  }

  const vnode = m(tag, props, normalizedChildren, flag, delta);
  return tag === 'svg' ? svg(vnode) : vnode;
};
