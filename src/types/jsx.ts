import type { DeltaOperation, VElement, VNode, VProps } from './base';

export type JSXVNode = VNode | number | boolean | undefined | null;
export type FC = (props?: VProps, key?: string | null) => VElement;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = VNode;
  export interface IntrinsicElements {
    [elemName: string]: VProps;
  }
}

export { DeltaOperation, VElement, VNode, VProps };
