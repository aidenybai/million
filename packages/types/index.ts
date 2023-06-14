import type { Props, block as createBlock } from '../million';
import type { ReactNode } from 'react';

export type MillionProps = Record<
  string,
  any
>;

export interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
  block?: any;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => ReactNode;
}

export interface ArrayCache<T> {
  each: T[] | null;
  children: T[] | null;
  block?: ReturnType<typeof createBlock>;
}