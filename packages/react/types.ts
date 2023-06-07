import { Block } from 'packages/million';
import type { Props } from '../million/types';
import type { FC } from 'react';

export type MillionBlock<T> = FC<T>;

export interface MillionArrayProps {
  each: any[];
  children: (value: any, i: number) => any;
}

export interface ArrayCache {
  each: any[] | null;
  children: any[] | null;
  block?: any;
}
