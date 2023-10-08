import * as react from 'react';
import { ReactNode } from 'react';
import { B as Block } from './block-878fb9ae.js';
import { P as Props, V as VNode } from './types-35702ad2.js';

interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
}
declare const REGISTRY: Map<
  (props: Props) => ReactNode,
  (
    props?: Props | null | undefined,
    key?: string | undefined,
    shouldUpdateCurrentBlock?:
      | ((oldProps: Props, newProps: Props) => boolean)
      | undefined,
  ) => Block
>;
declare const block: (
  fn: (props: Props) => ReactNode,
  options?: Options,
) => (props: Props) => react.FunctionComponentElement<{
  children?: ReactNode;
}>;

interface MillionArrayProps {
  each: any[];
  children: (value: any, i: number) => ReactNode;
}
declare const For: react.NamedExoticComponent<MillionArrayProps>;

declare const renderReactScope: (
  jsx: ReactNode,
) => (el: HTMLElement | null) => HTMLElement;
declare const unwrap: (vnode?: ReactNode) => VNode;

export { For, REGISTRY, block, renderReactScope, unwrap };
