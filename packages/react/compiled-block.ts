// The following code are for the compield `block` components
import type { ReactPortal, ComponentType, JSX } from 'react';
import { createElement, useState, Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MillionPortal, MillionProps, Options } from '../types';
import { block } from './block';
import { renderReactScope } from './utils';
import { experimental_options } from '../million/experimental';

function isEqual(a: unknown, b: unknown): boolean {
  // Faster than Object.is
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b);
}

function shouldCompiledBlockUpdate(
  prev: MillionProps,
  next: MillionProps
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
  { portals, ...options }: CompiledBlockOptions
): ComponentType<MillionProps> {
  const noSlot = options?.experimental_noSlot ?? experimental_options.noSlot;
  const RenderBlock = block<MillionProps>((props) => render(props), {
    ...options,
    name: `CompiledBlock(Inner(${options.name}))`,
    shouldUpdate: shouldCompiledBlockUpdate,
  });

  const portalCount = portals?.length || 0;

  const Component: ComponentType<MillionProps> =
    portals && portalCount > 0
      ? (props: MillionProps) => {
          const [current] = useState<MillionPortal[]>(() => []);

          let derived = { ...props };

          for (let i = 0; i < portalCount; i++) {
            const index = portals[i]!;
            const scope = renderReactScope(
              derived[index] as JSX.Element,
              false,
              current,
              i
            );
            // if (!noSlot) {
            derived[index] = scope;
            // }
          }

          const targets: ReactPortal[] = [];

          for (let i = 0, len = current.length; i < len; i++) {
            targets[i] = current[i]!.portal;
          }

          const documentFragment = document.createElement('template');
          const targetNode = noSlot
            ? createPortal(
                createElement(Fragment, { children: targets }),
                documentFragment
              )
            : targets;
    console.log(targetNode)

          return createElement(
            Fragment,
            {},
            createElement(RenderBlock, derived),
            targetNode
          );
        }
      : (props: MillionProps) => createElement(RenderBlock, props);

  // TODO dev mode
  if (options.name) {
    Component.displayName = `Million(CompiledBlock(Outer(${options.name})))`;
  }

  return Component;
}
