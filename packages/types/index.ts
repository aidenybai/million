import type { block as createBlock } from '../million';

export type MillionProps = Record<
  string,
  any
>;

export interface Options {
  shouldUpdate?: (oldProps: MillionProps, newProps: MillionProps) => boolean;
  block?: any;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => JSX.Element;
}

export interface ArrayCache<T> {
  each: T[] | null;
  children: T[] | null;
  block?: ReturnType<typeof createBlock>;
}
