
// The following code are for the compield `block` components
import { createElement, useState, type JSX, Fragment, ReactPortal, ComponentType } from 'react';
import type { MillionPortal, MillionProps, Options } from '../types';
import { block } from "./block";
import { renderReactScope } from './utils';

interface CompiledBlockProps extends MillionProps {
  v: unknown[];
}

function isEqual(a: unknown, b: unknown): boolean {
  // Faster than Object.is
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b);
}

function areCompiledBlockPropsEqual(prev: CompiledBlockProps, next: CompiledBlockProps): boolean {
  for (let i = 0, len = prev.v.length; i < len; i++) {
    if (!isEqual(prev.v[i], next.v[i])) {
      return false;
    }
  }
  return true;
}

interface CompiledBlockOptions extends Omit<Options<CompiledBlockProps>, 'shouldUpdate'> {
  portals: number[];
}

export function compiledBlock(
  render: (values: unknown[]) => JSX.Element,
  { portals, ...options }: CompiledBlockOptions,
): ComponentType<CompiledBlockProps> {
  const RenderBlock = block<CompiledBlockProps>((props) => render(props.v), {
    ...options,
    name: `Internal(Inner(${options.name}))`,
    shouldUpdate: areCompiledBlockPropsEqual,
  });

  const portalCount = portals.length;

  const Component: ComponentType<CompiledBlockProps> = portalCount > 0 ? (props: CompiledBlockProps) => {
    const [current] = useState<MillionPortal[]>(() => []);

    const derived = [...props.v];

    for (let i = 0; i < portalCount; i++) {
      const index = portals[i]!;
      derived[index] = renderReactScope(
        derived[index] as JSX.Element,
        false,
        current,
        i,
      );
    }

    const targets: ReactPortal[] = [];

    for (let i = 0, len = current.length; i < len; i++) {
      targets[i] = current[i]!.portal;
    }

    return createElement(Fragment, {}, [
      createElement(RenderBlock, {
        v: derived,
      }),
      targets,
    ]);
  } : (props: CompiledBlockProps) => createElement(RenderBlock, {
    v: props.v,
  });

  // TODO dev mode
  if (options.name) {
    Component.displayName = `Million(Internal(Outer(${options.name})))`;
  }

  return Component;
}