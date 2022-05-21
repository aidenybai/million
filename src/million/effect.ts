import { DOMNode, Effect, EffectTypes } from './types';

export const effect = (el: DOMNode, effects: Effect[]) => {
  return (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type: type, flush });
  };
};
