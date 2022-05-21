import { DOMNode, Effect, EffectTypes } from './types';

export const createEffectQueue = (el: DOMNode, effects: Effect[]) => {
  return (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type: type, flush });
  };
};
