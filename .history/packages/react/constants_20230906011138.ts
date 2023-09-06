import type { ComponentType } from 'react';
import { useEffect } from 'react';


export const SVG_RENDER_SCOPE = 'g';
export const REACT_ROOT = '__react_root';

export const Effect = ({ effect }: { effect: () => void }): null => {
  useEffect(effect, []);
  return null;
};

export const REGISTRY = new Map<ComponentType, any>();
