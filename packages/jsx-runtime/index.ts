import type { Props, VNode } from '../million';

export const h = (
  type: string,
  props: Props | null = {},
  ...children: VNode[]
): VNode => {
  if (props === null) props = {};
  props.children = children;
  return {
    type,
    props,
  };
};
export { h as createElement, h as jsx, h as jsxs };
