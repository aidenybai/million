import { createEffectQueuer } from '../effect';
import {
  COLON_CHAR,
  Commit,
  Driver,
  Effect,
  EffectTypes,
  VElement,
  XLINK_NS,
  XML_NS,
  X_CHAR,
} from '../types';

export const updateProp = (
  el: HTMLElement | SVGElement,
  propName: string,
  oldPropValue: unknown,
  newPropValue: unknown,
  effects: Effect[],
): void => {
  if (oldPropValue === newPropValue) return;
  const queueEffect = createEffectQueuer(el, effects);
  if (propName.startsWith('on')) {
    const eventPropName = propName.slice(2).toLowerCase();
    queueEffect(EffectTypes.SET_PROP, () => {
      el.removeEventListener(eventPropName, oldPropValue as EventListener);
      el.addEventListener(eventPropName, newPropValue as EventListener);
    });
  } else if (propName.charCodeAt(0) === X_CHAR) {
    if (propName.charCodeAt(3) === COLON_CHAR) {
      el.setAttributeNS(XML_NS, propName, String(newPropValue));
    } else if (propName.charCodeAt(5) === COLON_CHAR) {
      el.setAttributeNS(XLINK_NS, propName, String(newPropValue));
    }
  } else if (el[propName] !== undefined && !(el instanceof SVGElement)) {
    if (newPropValue) {
      queueEffect(EffectTypes.SET_PROP, () => (el[propName] = newPropValue));
    } else {
      queueEffect(EffectTypes.REMOVE_PROP, () => {
        el[propName] = '';
        el.removeAttribute(propName);
        delete el[propName];
      });
    }
  } else if (!newPropValue) {
    queueEffect(EffectTypes.REMOVE_PROP, () => el.removeAttribute(propName));
  } else {
    queueEffect(EffectTypes.SET_PROP, () => el.setAttribute(propName, String(newPropValue)));
  }
};

/**
 * Diffs two VNode props and modifies the DOM node based on the necessary changes
 */
export const useProps =
  (drivers: any[] = []): any =>
  (
    el: HTMLElement | SVGElement,
    newVNode: VElement,
    oldVNode?: VElement,
    commit: Commit = (work: () => void) => work(),
    effects: Effect[] = [],
  ): ReturnType<Driver> => {
    const oldProps = oldVNode?.props;
    const newProps = newVNode?.props;
    const data = {
      el,
      newVNode,
      oldVNode,
      effects,
    };
    if (oldProps !== newProps) {
      // Zero props optimization
      if (oldProps === undefined || newProps === null) {
        for (const propName in newProps) {
          updateProp(el, propName, undefined, newProps[propName], effects);
        }
      } else if (newProps === undefined || newProps === null) {
        for (const propName in oldProps) {
          updateProp(el, propName, oldProps[propName], undefined, effects);
        }
      } else {
        let matches = 0;
        for (const propName in oldProps!) {
          updateProp(
            el,
            propName,
            oldProps[propName],
            // Keep track the number of matches with newProps
            Reflect.has(newProps, propName) ? (matches++, newProps![propName]) : undefined,
            effects,
          );
        }

        const keys = Object.keys(newProps!);
        // Limit to number of matches to reduce the number of iterations
        for (let i = 0; matches < keys.length && i < keys.length; ++i) {
          const propName = keys[i];
          if (!Reflect.has(oldProps, propName)) {
            updateProp(el, propName, undefined, newProps![propName], effects);
            ++matches;
          }
        }
      }
    }
    for (let i = 0; i < drivers.length; ++i) {
      commit(() => {
        (drivers[i] as Driver)(el, newVNode, oldVNode, commit, effects);
      }, data);
    }
    return data;
  };
