import { useEffect } from 'react';
import type { ComponentType, DependencyList } from 'react';

export const REACT_ROOT = '__react_root';

export const Effect = ({
  effect,
  deps,
}: {
  effect: () => void;
  deps?: DependencyList;
}): null => {
  useEffect(effect, deps || []);
  return null;
};

export const REGISTRY = new Map<ComponentType, any>();
