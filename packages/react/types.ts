import type { Props } from '../million/types';

export interface MillionArrayProps {
  each: any[];
  children: (value: any, i: number) => any;
}

export interface ArrayCache {
  each: any[] | null;
  children: any[] | null;
  block?: any;
}

export interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
  block?: any;
}
