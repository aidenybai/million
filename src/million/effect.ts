import { DOMNode, Effect, EffectTypes } from './types';

export const createEffectQueuer = (el: DOMNode, effects: Effect[]) => {
  return (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type: type, flush });
  };
};
