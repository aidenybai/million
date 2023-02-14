/* eslint-disable @typescript-eslint/unbound-method */

const EVENT_LISTENERS_POOL = '__listeners';
const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const XML_NS = 'http://www.w3.org/2000/xmlns/';
const X_CHAR = 120;
const EVENTS_REGISTRY = new Map<string, boolean>();
let listenerPointer = 0;

// Caching prototypes for performance
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

export const createEventListener = (
  el: HTMLElement,
  name: string,
  value?: EventListener,
) => {
  const event = name.toLowerCase().slice(2);
  if (!EVENTS_REGISTRY.has(event)) {
    // createEventListener uses a synthetic event handler to capture events
    // https://betterprogramming.pub/whats-the-difference-between-synthetic-react-events-and-javascript-events-ba7dbc742294
    addEventListener$.call(
      document,
      event,
      ({ target }) => {
        let el = target as Node | null;
        // Bubble up the DOM tree to find all event listeners
        while (el) {
          const pool = el[EVENT_LISTENERS_POOL];
          if (pool) {
            const listeners = pool[event] as Record<string, any> | undefined;
            if (listeners) {
              const handlers = Object.values(listeners);
              for (let i = 0, j = handlers.length; i < j; ++i) {
                handlers[i](event);
              }
            }
          }
          el = el.parentNode;
        }
      },
      {
        capture: false,
      },
    );
    EVENTS_REGISTRY.set(event, true);
  }
  const pointer = listenerPointer++;
  return (newValue?: EventListener) => {
    if (!el[EVENT_LISTENERS_POOL]) el[EVENT_LISTENERS_POOL] = {};
    const pool = el[EVENT_LISTENERS_POOL];
    if (!pool[event]) pool[event] = {};
    pool[event][pointer] = (e: Event) => {
      (newValue ?? value)?.(e);
    };
  };
};

export const insertText = (
  el: HTMLElement,
  value: any,
  index: number,
): Text => {
  const node = document.createTextNode(value);
  const childNodes = childNodes$.call(el);
  if (hasChildNodes$.call(el) && index < childNodes.length) {
    insertBefore$.call(el, node, childNodes[index]);
  } else {
    appendChild$.call(el, node);
  }
  return node;
};

export const setText = (el: HTMLElement, value: string, index: number) => {
  setTextContent$.call(childNodes$.call(el)[index], value);
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
    } else if (name.startsWith('-')) {
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
  // Handle SVG namespaced attributes
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
