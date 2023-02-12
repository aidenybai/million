import { Hole, Props } from './types';

export const $once = (hole: Hole) => {
  hole.once = true;
};

export const $wire = (
  value: (props: Props) => any,
  keyOrHole?: string | Hole,
) => {
  const cache = new Map();
  const hole = new Hole('');
  const isMemo = keyOrHole !== undefined;
  const isHole = keyOrHole instanceof Hole;
  hole.wire = (props: Props) => {
    // Great for event listeners that need to be re-created on every render
    // Cached functions reduce the number of patches.
    const key = isHole ? props[keyOrHole.key] : keyOrHole;
    if (isMemo && cache.has(key)) return cache.get(key);
    const ret = value(props);
    if (isMemo) cache.set(key, ret);
    return ret;
  };
  return hole;
};
