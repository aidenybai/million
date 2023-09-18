import { useEffect } from 'preact/hooks';

export const RENDER_SCOPE = 'slot';
export const SVG_RENDER_SCOPE = 'g';

export const Effect = ({ effect }: { effect: () => void }): null => {
  useEffect(effect, []);
  return null;
};
