import { Flags } from '../types';
import type { Delta, Props, VNode, VElement } from '../types';

export const m = (
  tag: string,
  props?: Props | null,
  children: VNode[] | null | undefined = props?.children,
  flag: Flags = Flags.ELEMENT,
  delta?: Delta[],
): VElement => {
  const key = props?.key as string | undefined;
  const ref = props?.ref as { current: any };
  if (props?.key) delete props.key;
  if (props?.ref) delete props.ref;
  if (props?.children) delete props.children;
  const velement: VElement = {
    tag,
    props,
    children,
    key,
    flag,
    delta,
    hook,
    ref,
  };
  return velement.tag.toLowerCase() === 'svg' ? svg(velement) : velement;
};

export function h(
  this: any,
  tag: string | FC,
  props?: VProps | null,
  ...children: RawVNode[]
): VNode | VNode[] {
  const propsWithChildren = { ...props, children };
  if (tag === Fragment) return normalize(children) || [];
  if (tag.prototype?.render) {
    tag[this.field] = true;
    return this?.handleClass
      ? this.handleClass(tag, propsWithChildren)
      : tag.render();
  }
  if (typeof tag === 'function') {
    tag[this.field] = true;
    return this?.handleFunction
      ? this.handleFunction(tag, propsWithChildren)
      : tag(propsWithChildren);
  }

  let flag: Flags = Flags.ELEMENT_NO_CHILDREN;
  let delta: Delta[] | undefined;
  let hook: Hooks | undefined;
  const normalizedChildren: VNode[] = [];
  if (props) {
    const rawDelta = props.delta as Delta[] | undefined;
    if (rawDelta?.length) {
      delta = rawDelta;
      props.delta = undefined;
    }
  }
  if (props) {
    const rawHook = props.hook;
    if (rawHook) {
      if (Array.isArray(rawHook)) hook = mergeHooks(rawHook);
      else hook = rawHook;
      props.hook = undefined;
    }
  }
  if (children.length) {
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
              if (
                typeof subChildren[i].key === 'string' &&
                subChildren[i].key !== ''
              ) {
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
      const normalizedStyle = Object.keys(rawStyle).some((key) =>
        /[-A-Z]/gim.test(key),
      )
        ? kebab(rawStyle)
        : rawStyle;
      props.style = style(normalizedStyle as Record<string, string>);
    }
  }

  return m(tag, props, normalizedChildren, flag, delta, hook);
}
