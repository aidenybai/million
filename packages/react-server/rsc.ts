import type {
  ComponentType,
} from 'react';
import { MillionArrayProps, MillionProps, Options } from "../types"

console.warn('Deoptimization Warning: million would have no effect in React Server Components unless unstable_postpone is shipped in React and Nextjs.')

export const block = <P extends MillionProps>(
  Component: ComponentType<P>,
  _options: Options = {},
) => {
  return Component
}

export function For<T>({ each, children }: MillionArrayProps<T>) {
  return each.map(children)
}
