import { className, Flags, m, style, svg } from '../million/index';
import { kebab } from '../million/m';
import type { DeltaOperation, VNode, VProps } from '../million/types';
import type { JSXVNode } from '../jsx-runtime/types';

export const normalize = (jsxVNode: JSXVNode): VNode | VNode[] | undefined => {
  if (Array.isArray(jsxVNode)) {
    const normalizedChildren: VNode[] = [];
    for (let i = 0; i < jsxVNode.length; i++) {
      normalizedChildren.push(<VNode>normalize(jsxVNode[i]));
    }
    return normalizedChildren;
  } else if (
    typeof jsxVNode === 'string' ||
    typeof jsxVNode === 'number' ||
    typeof jsxVNode === 'boolean'
  ) {
    return String(jsxVNode);
  } else {
    return <VNode>jsxVNode;
  }
};

export const h = (tag: string, props?: VProps, ...children: JSXVNode[]) => {
  let flag = Flags.NO_CHILDREN;
  let delta: DeltaOperation[] | undefined;
  const normalizedChildren: VNode[] = [];
  if (props) {
    const rawDelta = <DeltaOperation[]>(<unknown>props.delta);
    if (rawDelta && rawDelta.length) {
      delta = rawDelta;
      delete props.delta;
    }
  }
  if (children) {
    const keysInChildren = new Set();
    let hasVElementChildren = false;
    flag = Flags.ANY_CHILDREN;

    if (children.every((child) => typeof child === 'string')) {
      flag = Flags.ONLY_TEXT_CHILDREN;
    }
    let childrenLength = 0;
    for (let i = 0; i < children.length; ++i) {
      if (
        children[i] !== undefined &&
        children[i] !== null &&
        children[i] !== false &&
        children[i] !== ''
      ) {
        const unwrappedChild = <VNode>normalize(children[i]);
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
      flag = Flags.ONLY_KEYED_CHILDREN;
    }
    if (!hasVElementChildren) {
      flag = Flags.ONLY_TEXT_CHILDREN;
    }
  }
  if (props) {
    if (typeof props.flag === 'number') {
      flag = <Flags>(<unknown>props.flag);
      delete props.flag;
    }
    if (typeof props.className === 'object') {
      props.className = className(<Record<string, boolean>>(<unknown>props.className));
    }
    if (typeof props.style === 'object') {
      const rawStyle = <Record<string, string>>(<unknown>props.style);
      const normalizedStyle = Object.keys(rawStyle).some((key) => /[-A-Z]/gim.test(key))
        ? kebab(rawStyle)
        : rawStyle;
      props.style = style(<Record<string, string>>normalizedStyle);
    }
  }

  const vnode = m(tag, props, normalizedChildren, flag, delta);
  return tag === 'svg' ? svg(vnode) : vnode;
};
