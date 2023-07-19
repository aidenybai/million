import { useEffect } from 'preact/hooks';
import type { ComponentType, FunctionComponent as FC } from 'preact';

export const RENDER_SCOPE = 'slot';
export const SVG_RENDER_SCOPE = 'g';
export const REACT_ROOT = '__react_root';

export const Effect: FC<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};

export const REGISTRY = new Map<ComponentType, any>();
