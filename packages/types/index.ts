import type { ReactPortal } from 'react';
import type { block as createBlock } from '../million';

export type MillionProps = Record<string, any>;

export interface Options<T extends MillionProps> {
  name?: string;
  shouldUpdate?: (oldProps: T, newProps: T) => boolean;
  block?: any;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
  rsc?: boolean;
  compiled?: boolean;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => JSX.Element;
  memo?: true;
  ssr?: boolean;
  html?: string;
  rsc?: boolean;
  scoped?: boolean;
  [key: string]: any;
}

export interface ArrayCache<T> {
  each: T[] | null;
  children: T[] | null;
  mounted: boolean;
  block?: ReturnType<typeof createBlock>;
}

export interface MillionPortal {
  foreign: true;
  current: Element;
  portal: ReactPortal;
  unstable?: boolean;
  p?: {
    parent: Element | null;
    promise: Promise<null>;
    resolve: (value: null) => void;
  };
}
