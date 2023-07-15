import { useEffect } from 'react';
<<<<<<< HEAD
=======
import type { ComponentType, FC } from 'react';
>>>>>>> main

export const RENDER_SCOPE = 'slot';
export const SVG_RENDER_SCOPE = 'g';
export const REACT_ROOT = '__react_root';

export const Effect = ({ effect }: { effect: () => void }): null => {
  useEffect(effect, []);
  return null;
};

export const REGISTRY = new Map<ComponentType, any>();
