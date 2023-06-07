import { Block } from 'packages/million';

export type MillionProps = Record<
  string,
  string | number | boolean | null | undefined | Block | Symbol | BigInt
>;

export { Block };
