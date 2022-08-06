import { DeltaTypes, Flags } from './types';
import type {
  Delta,
  DOMNode,
  Hooks,
  HookTypes,
  VElement,
  VNode,
  VProps,
  Hook,
} from './types';

/**
 * Attaches ns props to svg element
 */
export const svg = (vnode: VElement): VElement => {
  /* istanbul ignore next */
  if (!vnode.props) vnode.props = {};
  ns(vnode.tag, vnode.props, vnode.children);
  return vnode;
};

/**
 * Attaches ns props to an arbitrary element
 */
export const ns = (
  tag: string,
  props: VProps,
  children?: VNode[] | null,
): void => {
  if (props.className) {
    props.class = props.className;
    props.className = undefined;
  }
  props.ns = 'http://www.w3.org/2000/svg';
  if (children && tag !== 'foreignObject') {
    for (const child of children) {
      if (typeof child !== 'string' && child.props) {
        ns(child.tag, child.props, child.children);
      }
    }
  }
};

/**
 * Generates a className string based on a classObject
 */
export const className = (classObject: Record<string, boolean>): string =>
  Object.keys(classObject)
    .filter((className) => classObject[className])
    .join(' ');

/**
 * Generates a style string based on a styleObject
 */
export const style = (styleObject: Record<string, string>): string =>
  Object.entries(styleObject)
    .map((style) => style.join(':'))
    .join(';');

/**
 * Converts key names from camelCase to kebab-case
 */
export const kebab = (
  camelCaseObject: Record<string, unknown>,
): Record<string, unknown> => {
  const kebabCaseObject: Record<string, unknown> = {};
  for (const key in camelCaseObject) {
    // eslint-disable-next-line prefer-named-capture-group
    kebabCaseObject[key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()] =
      camelCaseObject[key];
  }
  return kebabCaseObject;
};

export const Deltas = {
  CREATE: (i = 0): Delta => [DeltaTypes.CREATE, i],
  UPDATE: (i = 0): Delta => [DeltaTypes.UPDATE, i],
  REMOVE: (i = 0): Delta => [DeltaTypes.REMOVE, i],
};

/**
 * Helper method for creating a VNode
 */
export const m = (
  tag: string,
  props?: VProps | null,
  children: VNode[] | null | undefined = props?.children,
  flag: Flags = Flags.ELEMENT,
  delta?: Delta[],
  hook?: Hooks,
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

export const mergeHooks = (hooksArray: Hooks[]): Hooks => {
  const mergedHooks: Hooks = {};
  for (let i = 0; i < hooksArray.length; i++) {
    const hooksKeys = Object.keys(hooksArray[i]!);
    for (let j = 0; j < hooksKeys.length; j++) {
      const hook = hooksKeys[j] as HookTypes;
      const oldHook = mergedHooks[hook] as Hook | undefined;
      if (oldHook) {
        mergedHooks[hook] = (
          el?: DOMNode,
          newVNode?: VNode,
          oldVNode?: VNode,
        ): boolean => {
          const newHook = hooksArray[i]![hook] as Hook;
          return (
            oldHook(el, newVNode, oldVNode) && newHook(el, newVNode, oldVNode)
          );
        };
      } else {
        mergedHooks[hook] = hooksArray[i]![hook];
      }
    }
  }
  return mergedHooks;
};
