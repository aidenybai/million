import { Block, Props } from 'packages/million';

export type MillionProps = Record<
  string,
  string | number | boolean | null | undefined | Block | symbol | bigint
>;

export interface Options {
  shouldUpdate?: (oldProps: Props, newProps: Props) => boolean;
  block?: any;
}
