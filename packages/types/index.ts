import type { Props, block as createBlock } from '../million';
import type { ComponentType, ReactNode } from 'react';

export type MillionProps = Record<string, any>;

export interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
  block?: any;
  original?: ComponentType<any>;
  analytics?: (analytics: Analytics) => void;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => ReactNode;
  memo?: true;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
  [key: string]: any;
}

export interface ArrayCache<T> {
  each: T[] | null;
  children: T[] | null;
  mounted?: boolean | null;
  block?: ReturnType<typeof createBlock>;
}

export interface Analytics {
  elements: number;
  components: number;
  attributes: number;
  data: number;
  traversals: number;
}
