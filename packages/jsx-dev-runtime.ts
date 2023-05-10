import type { Props, VNode } from './million';

export const jsxDEV = (
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
export { jsxDEV as createElement, jsxDEV as jsx, jsxDEV as jsxs };
