import { DOMNode, OLD_VNODE_FIELD, VNode } from './types/base';

/**
 * Creates an Element from a VNode
 */
export const createElement = (vnode: VNode, attachField = true): DOMNode => {
  if (typeof vnode === 'string') return document.createTextNode(vnode);

  const el = vnode.props?.ns
    ? <SVGElement>document.createElementNS(<string>vnode.props?.ns, vnode.tag)
    : <HTMLElement>document.createElement(vnode.tag);

  for (const propName in vnode.props) {
    const propValue = vnode.props[propName];
    if (propName.startsWith('on')) {
      const eventPropName = propName.slice(2).toLowerCase();
      el.addEventListener(eventPropName, <EventListener>propValue);
    } else if (el[propName] !== undefined && !(el instanceof SVGElement)) {
      el[propName] = propValue;
    } else {
      el.setAttribute(propName, String(propValue));
    }
  }

  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; ++i) {
      el.appendChild(createElement(vnode.children[i]));
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
