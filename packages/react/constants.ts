import { useEffect } from 'react';
import type { FC } from 'react';

export const RENDER_SCOPE = 'slot';
export const REACT_ROOT = '__react_root';

export const Effect: FC<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
