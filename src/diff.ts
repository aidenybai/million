import { Attributes, VNode, VNodeChildren } from './h';
import { createElement } from './element';

type Patch = (el: HTMLElement) => HTMLElement | Text | undefined;

const entrifyPatchAndChildNodes = (
  patchFunctions: Patch[],
  childNodes: NodeListOf<ChildNode>,
): (ChildNode | Patch)[][] => {
  const entries = [];
  for (let i = 0; i < Math.min(patchFunctions.length, childNodes.length); i++) {
    entries.push([patchFunctions[i] as Patch, childNodes[i] as ChildNode]);
  }
  return entries;
};

const diffAttributes = (oldAttributes: Attributes = {}, newAttributes: Attributes = {}): Patch => {
  const patchQueue: Patch[] = [];

  Object.keys(oldAttributes).forEach((key) => {
    if (!newAttributes[key]) {
      patchQueue.push((element: HTMLElement): HTMLElement => {
        element.removeAttribute(key);
        return element;
      });
    }
  });

  Object.entries(newAttributes).forEach(([key, value]) => {
    patchQueue.push((element: HTMLElement): HTMLElement => {
      element.setAttribute(key, value);
      return element;
    });
  });

  return (element: HTMLElement): HTMLElement => {
    patchQueue.forEach((patch: Patch) => {
      patch(element);
    });
    return element;
  };
};

const diffChildren = (oldVNodeChildren: VNodeChildren = [], newVNodeChildren: VNodeChildren = []): Patch => {
  const patchQueue: Patch[] = [];
  const patchCleanupQueue: Patch[] = [];
  oldVNodeChildren.forEach((oldVChild, i) => {
    patchQueue.push(diff(oldVChild, newVNodeChildren[i]));
  });

  newVNodeChildren.forEach((unresolvedVNodeChild) => {
    patchCleanupQueue.push((element: HTMLElement): HTMLElement => {
      element.appendChild(createElement(unresolvedVNodeChild));
      return element;
    });
  });

  return (parentElement: HTMLElement) => {
    entrifyPatchAndChildNodes(patchQueue, parentElement.childNodes).forEach(([patch, child]) => {
      (patch as Patch)(child as HTMLElement);
    });
    patchCleanupQueue.forEach((patch: Patch) => {
      patch(parentElement);
    });
    return parentElement;
  };
};

export const diff = (
  oldVNode: VNode | string | undefined,
  newVNode: VNode | string | undefined,
): Patch => {
  if (newVNode === undefined) {
    return (element: HTMLElement): undefined => {
      element.remove();
      return undefined;
    };
  }

  const stringsNotEqual =
    (typeof oldVNode === 'string' || typeof newVNode === 'string') && oldVNode !== newVNode;
  const tagsNotEqual = (oldVNode as VNode)?.tag !== (newVNode as VNode)?.tag;

  if (stringsNotEqual || tagsNotEqual) {
    return (element: HTMLElement): HTMLElement | Text => {
      const newElement = createElement(newVNode);
      element.replaceWith(newElement);
      return newElement;
    };
  }

  return (element: HTMLElement): HTMLElement => {
    if (typeof oldVNode !== 'string' && typeof newVNode !== 'string' && oldVNode) {
      diffAttributes(oldVNode.attributes, newVNode.attributes)(element);
      diffChildren(oldVNode.children, newVNode.children)(element);
    }
    return element;
  };
};
