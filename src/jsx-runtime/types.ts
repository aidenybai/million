import type { VNode, VProps } from '../million/types';

export type FC = (props?: VProps, key?: string | null) => any;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = VNode;
  export interface IntrinsicElements {
    [el: string]: VProps;
  }
}
