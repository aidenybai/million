// The following code are for the compield `block` components
import type { ReactPortal, ComponentType, JSX } from 'react';
import { createElement, useState, useContext, Fragment } from 'react';
import type { MillionPortal, MillionProps, Options } from '../types';
import { block } from './block';
import { renderReactScope, scopedContext } from './utils';

function isEqual(a: unknown, b: unknown): boolean {
  // Faster than Object.is
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b);
}

function shouldCompiledBlockUpdate(
  prev: MillionProps,
  next: MillionProps,
): boolean {
  for (const key in prev) {
    if (!isEqual(prev[key], next[key])) {
      return true;
    }
  }
  return false;
}

interface CompiledBlockOptions
  extends Omit<Options<MillionProps>, 'shouldUpdate'> {
  portals?: string[];
}

export function compiledBlock(
  render: (props: MillionProps) => JSX.Element,
  { portals, ...options }: CompiledBlockOptions,
): ComponentType<MillionProps> {
  const blockName = `CompiledBlock(Inner(${options.name}))`;
  const RenderBlock = block<MillionProps>((props) => render(props), {
    ...options,
    scoped: undefined,
    name: blockName,
    shouldUpdate: shouldCompiledBlockUpdate,
  });

  const portalCount = portals?.length || 0;

  const Component: ComponentType<MillionProps> =
    portals && portalCount > 0
      ? (props: MillionProps) => {
          const scoped = useContext(scopedContext);
          const [current] = useState<MillionPortal[]>(() => []);

          const derived = { ...props, scoped };

          for (let i = 0; i < portalCount; i++) {
            const index = portals[i]!;
            const scope = renderReactScope(
              derived[index] as JSX.Element,
              false,
              current,
              i,
            );
            derived[index] = scope;
          }

          const targets: ReactPortal[] = [];

          for (let i = 0, len = current.length; i < len; i++) {
            targets[i] = current[i]!.portal;
          }

          return createElement(
            Fragment,
            null,
            createElement(RenderBlock, derived),
            targets,
          );
        }
      : (props: MillionProps) => createElement(RenderBlock, props);

  // TODO dev mode
  if (options.name) {
    Component.displayName = `Million(CompiledBlock(Outer(${options.name})))`;
  }

  return Component;
}
