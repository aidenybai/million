import {
  Commit,
  createElement,
  DOMNode,
  Effect,
  Driver,
  OLD_VNODE_FIELD,
  useChildren,
  VElement,
  VEntity,
  VNode,
  EffectTypes,
} from 'packages/million';

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy',
];
const colors = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
];
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
];

const random = (max: number) => {
  return Math.round(Math.random() * 1000) % max;
};

let id = 0;

export const buildData = (count: number) => {
  const data = new Array(count).fill(0);
  for (let i = 0; i < count; ++i) {
    data[i] = {
      id: id++,
      label: `${adjectives[random(adjectives.length)]} ${colors[random(colors.length)]} ${
        nouns[random(nouns.length)]
      }`,
    };
  }
  return data;
};

const useNode = (drivers: Partial<Driver>[]) => {
  const nodeDriver = (
    el: DOMNode,
    newVNode?: VNode,
    oldVNode?: VNode,
    commit: Commit = (work: () => void) => work(),
    effects: Effect[] = [],
  ): ReturnType<Driver> => {
    const finish = (element: DOMNode): ReturnType<Driver> => {
      if (!oldVNode) {
        effects.push({
          el,
          type: EffectTypes.SET_PROP,
          flush: () => (element[OLD_VNODE_FIELD] = newVNode),
        });
      }

      return {
        el: element,
        newVNode: newVNode as VNode,
        oldVNode: oldVNode as VNode,
        effects,
      };
    };

    if (newVNode === undefined || newVNode === null) {
      effects.push({
        el,
        type: EffectTypes.REMOVE,
        flush: () => el.remove(),
      });
      return finish(el);
    } else {
      let prevVNode: VNode | VEntity | undefined = oldVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof prevVNode === 'string' || typeof newVNode === 'string';

      if (hasString && prevVNode !== newVNode) {
        const newEl = createElement(newVNode as string, false);
        effects.push({
          el,
          type: EffectTypes.REPLACE,
          flush: () => el.replaceWith(newEl),
        });

        return finish(newEl);
      }
      if (!hasString) {
        const oldVElement = prevVNode as VElement;
        const newVElement = newVNode as VElement;

        if (
          (oldVElement?.key === undefined && newVElement?.key === undefined) ||
          oldVElement?.key !== newVElement?.key
        ) {
          if (oldVElement?.tag !== newVElement?.tag || el instanceof Text) {
            const newEl = createElement(newVElement, false);
            effects.push({
              el,
              type: EffectTypes.REPLACE,
              flush: () => el.replaceWith(newEl),
            });
            return finish(newEl);
          }

          commit(
            () => {
              (drivers[0] as Driver)(el, newVElement, oldVElement, commit, effects, nodeDriver);
            },
            {
              el,
              newVNode: newVNode as VNode,
              oldVNode: oldVNode as VNode,
              effects,
            },
          );
        }
      }
    }

    return finish(el);
  };
  return nodeDriver;
};

export const diff = useNode([useChildren()]);

export const patch = (el: DOMNode, newVNode: VNode, oldVNode?: VNode) => {
  const data = diff(el, newVNode, oldVNode);
  for (let i = 0; i < data.effects!.length; i++) {
    data.effects![i].flush();
  }

  return data.el;
};
