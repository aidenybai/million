import { resolveVNode } from './m';
import {
  COLON_CHAR,
  DOMNode,
  Flags,
  OLD_VNODE_FIELD,
  VEntity,
  VNode,
  XLINK_NS,
  XML_NS,
  X_CHAR,
} from './types';

/**
 * Creates an Element from a VNode
 */
export const createElement = (vnode?: VNode | VEntity | null, attachField = true): DOMNode => {
  if (vnode === undefined || vnode === null) return document.createComment('');
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  if (typeof vnode === 'object' && vnode?.flag === Flags.ENTITY) {
    if (vnode.el) return vnode.el;
    else return createElement(resolveVNode(vnode));
  }

  const el = vnode.props?.ns
    ? <SVGElement>document.createElementNS(<string>vnode.props?.ns, vnode.tag)
    : <HTMLElement>document.createElement(vnode.tag);

  if (vnode.props) {
    for (const propName in vnode.props) {
      const propValue = vnode.props[propName];
      if (propName.startsWith('on')) {
        const eventPropName = propName.slice(2).toLowerCase();
        el.addEventListener(eventPropName, <EventListener>propValue);
      } else if (propName.charCodeAt(0) === X_CHAR) {
        if (propName.charCodeAt(3) === COLON_CHAR) {
          el.setAttributeNS(XML_NS, propName, String(propValue));
        } else if (propName.charCodeAt(5) === COLON_CHAR) {
          el.setAttributeNS(XLINK_NS, propName, String(propValue));
        }
      } else if (el[propName] !== undefined && !(el instanceof SVGElement)) {
        el[propName] = propValue;
      } else {
        el.setAttribute(propName, String(propValue));
      }
    }
  }

  if (vnode.children) {
    if (vnode.flag === Flags.ELEMENT_TEXT_CHILDREN) {
      el.textContent = Array.isArray(vnode.children) ? vnode.children?.join('') : vnode.children;
    } else {
      for (let i = 0; i < vnode.children.length; ++i) {
        el.appendChild(createElement(vnode.children[i], false));
      }
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
