import {
  COLON_CHAR,
  DOMNode,
  Flags,
  OLD_VNODE_FIELD,
  VElement,
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
  if ((<VEntity>vnode)?.data) {
    if ((<VEntity>vnode)?.el) return (<VEntity>vnode).el!;
    else return createElement((<VEntity>vnode)?.resolve());
  }
  if (vnode === undefined || vnode === null) return document.createComment('');
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const velement = <VElement>vnode;

  // istanbul ignore next
  const el = velement.props?.ns
    ? <SVGElement>document.createElementNS(<string>velement.props?.ns, velement.tag)
    : <HTMLElement>document.createElement(velement.tag);

  if (velement.props) {
    for (const propName in velement.props) {
      const propValue = velement.props[propName];
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

  if (velement.children) {
    if (velement.flag === Flags.ONLY_TEXT_CHILDREN) {
      el.textContent = Array.isArray(velement.children)
        ? velement.children?.join('')
        : velement.children;
    } else {
      for (let i = 0; i < velement.children.length; ++i) {
        el.appendChild(createElement(velement.children[i], false));
      }
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};
