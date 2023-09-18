import { useEffect } from 'react';
import type { ComponentType } from 'react';

export const RENDER_SCOPE = 'slot';
export const SVG_RENDER_SCOPE = 'g';

export const Effect = ({ effect }: { effect: () => void }): null => {
  useEffect(effect, []);
  return null;
};

export const REGISTRY = new Map<ComponentType, any>();
