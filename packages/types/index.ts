import type { block as createBlock } from '../million';
import type { ReactPortal } from 'react';

export type MillionProps = Record<string, any>;

export interface Options {
  shouldUpdate?: (oldProps: MillionProps, newProps: MillionProps) => boolean;
  block?: any;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => JSX.Element;
  memo?: true;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
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
  current: HTMLElement;
  portal: ReactPortal;
  unstable?: boolean;
}
