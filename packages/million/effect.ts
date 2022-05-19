import { DOMNode, Effect, EffectTypes } from './types';

export const createEffectQueuer = (el: DOMNode, effects: Effect[]) => {
  const queueEffect = (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type: type, flush });
  };
  return queueEffect;
};
