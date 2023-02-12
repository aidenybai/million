/* eslint-disable @typescript-eslint/prefer-string-starts-ends-with */
/* eslint-disable @typescript-eslint/unbound-method */

import {
  IS_NON_DIMENSIONAL,
  EVENT_LISTENERS_PROP,
  XLINK_NS,
  XML_NS,
  X_CHAR,
} from './constants';
import { Edit } from './types';

export const node$ = Node.prototype;
export const element$ = Element.prototype;
export const insertBefore$ = node$.insertBefore;
export const hasChildNodes$ = node$.hasChildNodes;
export const cloneNode$ = node$.cloneNode;
export const appendChild$ = node$.appendChild;
export const replaceChild$ = node$.replaceChild;
export const removeChild$ = node$.removeChild;
export const remove$ = element$.remove;
export const addEventListener$ = node$.addEventListener;
export const removeEventListener$ = node$.removeEventListener;
export const removeAttribute$ = element$.removeAttribute;
export const setAttribute$ = element$.setAttribute;
export const setAttributeNS$ = element$.setAttributeNS;
export const setTextContent$ = Object.getOwnPropertyDescriptor(
  node$,
  'textContent',
)!.set!;
export const childNodes$ = Object.getOwnPropertyDescriptor(node$, 'childNodes')!
  .get!;

let listenerPointer = 0;
export const createEventListener = (
  el: HTMLElement,
  name: string,
  value?: EventListener,
) => {
  const event =
    name.toLowerCase() in el ? name.toLowerCase().slice(2) : name.slice(2);
  const key = `${event}${listenerPointer++}`;
  const listener = (event: Event) => {
    el[EVENT_LISTENERS_PROP][key]?.(event);
  };

  if (!el[EVENT_LISTENERS_PROP]) el[EVENT_LISTENERS_PROP] = {};

  const mount = () => {
    el[EVENT_LISTENERS_PROP][key] = value;
    addEventListener$.call(el, event, listener);
  };

  const patch = (newValue?: EventListener | null) => {
    if (!newValue) {
      delete el[EVENT_LISTENERS_PROP][key];
      removeEventListener$.call(el, event, listener);
      return;
    }
    if (el[EVENT_LISTENERS_PROP][key] !== newValue) {
      el[EVENT_LISTENERS_PROP][key] = newValue;
    }
  };

  return { mount, patch };
};

export const insertText = (
  el: HTMLElement,
  value: any,
  index: number,
): void => {
  const node = document.createTextNode(String(value));
  if (hasChildNodes$.call(el) && index < el.childNodes.length) {
    const child = el.childNodes.item(index);
    insertBefore$.call(el, node, child);
  } else {
    appendChild$.call(el, node);
  }
};

export const setAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | boolean | null,
): void => {
  const isValueNully = value === undefined || value === null;
  value = isValueNully ? '' : value;
  if (name === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else if (name[0] === '-') {
      el.style.setProperty(name, String(value));
    } else if (isValueNully) {
      el.style[name] = '';
    } else if (typeof value !== 'number' || IS_NON_DIMENSIONAL.test(name)) {
      el.style[name] = value;
    } else {
      el.style[name] = `${String(value)}px`;
    }
    return;
  }
  if (name.charCodeAt(0) === X_CHAR) {
    // eslint-disable-next-line prefer-named-capture-group
    name = name.replace(/xlink(H|:h)/, 'h').replace(/sName$/, 's');
    if (name.startsWith('xmlns')) {
      setAttributeNS$.call(el, XML_NS, name, String(value));
    } else if (name.startsWith('xlink')) {
      setAttributeNS$.call(el, XLINK_NS, 'href', String(value));
    }
    return;
  }
  if (
    el[name] !== undefined &&
    el[name] !== null &&
    !Reflect.has(el.style, name) &&
    !(el instanceof SVGElement) &&
    name !== 'href' &&
    name !== 'list' &&
    name !== 'form' &&
    // cast to `0` instead
    name !== 'tabIndex' &&
    name !== 'download' &&
    name in el
  ) {
    try {
      el[name] = value;
    } catch (_err) {
      /**/
    }
  }
  if (
    !isValueNully &&
    value !== '' &&
    (value !== false || name.includes('-'))
  ) {
    setAttribute$.call(el, name, String(value));
  } else {
    removeAttribute$.call(el, name);
  }
};

export const getCurrentElement = (
  current: Edit,
  root: HTMLElement,
  cache?: Map<number, HTMLElement>,
  slot?: number,
): HTMLElement => {
  if (cache && slot && cache.has(slot)) return cache.get(slot)!;
  for (let k = 0, l = current.path.length; k < l; ++k) {
    root = childNodes$.call(root)[current.path[k]!] as HTMLElement;
  }
  if (cache && slot) cache.set(slot, root);
  return root;
};
