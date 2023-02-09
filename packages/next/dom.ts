/* eslint-disable @typescript-eslint/prefer-string-starts-ends-with */
/* eslint-disable @typescript-eslint/unbound-method */

export const node$ = Node.prototype;
export const element$ = Element.prototype;
export const insertBefore$ = node$.insertBefore;
export const hasChildNodes$ = node$.hasChildNodes;
export const cloneNode$ = node$.cloneNode;
export const appendChild$ = node$.appendChild;
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

export const EVENT_LISTENERS_PROP = '__listeners';
export const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
export const XML_NS = 'http://www.w3.org/2000/xmlns/';
export const X_CHAR = 120;

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
