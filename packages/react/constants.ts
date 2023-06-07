import { useEffect } from 'react';
import type { FC } from 'react';

export const RENDER_SCOPE = 'million-render-scope';
export const REACT_ROOT = '__react_root';
export const css = `${RENDER_SCOPE} { display: contents }`;

export const Effect: FC<{ effect: () => void }> = ({ effect }) => {
  useEffect(effect, []);
  return null;
};
