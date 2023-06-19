import { useEffect } from 'react';

export const RENDER_SCOPE = 'slot';
export const REACT_ROOT = '__react_root';

export const Effect = ({ effect }: { effect: () => void }): null => {
  useEffect(effect, []);
  return null;
};
