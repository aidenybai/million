import { createElement } from '../createElement';
import {
  Commit,
  DOMNode,
  DOMOperation,
  Driver,
  Flags,
  OLD_VNODE_FIELD,
  VElement,
  VEntity,
  VNode,
} from '../types';

/**
 * Diffs a single DOM node and modifies the DOM node based on the necessary changes
 */
export const useNode = (drivers: Partial<Driver>[]) => {
  const nodeDriver = (
    el: DOMNode,
    newVNode?: VNode | VEntity,
    oldVNode?: VNode | VEntity,
    commit?: Commit,
    effects: DOMOperation[] = [],
  ): ReturnType<Driver> => {
    const finish = (element: DOMNode): ReturnType<Driver> => {
      if (!oldVNode) {
        effects.push(() => (element[OLD_VNODE_FIELD] = newVNode));
      }

      return {
        el: element,
        newVNode: <VNode>newVNode,
        oldVNode: <VNode>oldVNode,
        effects,
      };
    };

    if (
      (<VElement>newVNode)?.flag === Flags.IGNORE_NODE ||
      (<VElement>oldVNode)?.flag === Flags.IGNORE_NODE
    ) {
      return finish(el);
    }

    if (newVNode === undefined || newVNode === null) {
      effects.push(() => el.remove());
      return finish(el);
    } else {
      let prevVNode: VNode | VEntity | undefined = oldVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof prevVNode === 'string' || typeof newVNode === 'string';

      if (hasString && prevVNode !== newVNode) {
        const newEl = createElement(<string>newVNode, false);
        effects.push(() => el.replaceWith(newEl));

        return finish(<DOMNode>newEl);
      }
      if (!hasString) {
        const prevVEntity = <VEntity>prevVNode;
        const newVEntity = <VEntity>newVNode;
        if (newVEntity.ignore) return finish(el);
        if (prevVEntity?.data) prevVNode = prevVEntity.resolve();
        if (newVEntity?.data) newVNode = newVEntity.resolve();

        const oldVElement = <VElement>prevVNode;
        const newVElement = <VElement>newVNode;

        if (newVElement.flag === Flags.REPLACE_NODE || oldVElement.flag === Flags.REPLACE_NODE) {
          const newEl = createElement(newVNode);
          el.replaceWith(newEl);
          return finish(el);
        }

        if (
          (oldVElement?.key === undefined && newVElement?.key === undefined) ||
          oldVElement?.key !== newVElement?.key
        ) {
          if (oldVElement?.tag !== newVElement?.tag || el instanceof Text) {
            const newEl = createElement(newVElement, false);
            effects.push(() => el.replaceWith(newEl));
            return finish(<DOMNode>newEl);
          }

          for (let i = 0; i < drivers.length; ++i) {
            commit!(
              () => {
                (<Driver>drivers[i])(el, newVElement, oldVElement, commit, effects, nodeDriver);
              },
              {
                el,
                newVNode: <VNode>newVNode,
                oldVNode: <VNode>oldVNode,
                effects,
              },
            );
          }
        }
      }
    }

    return finish(el);
  };
  return nodeDriver;
};
