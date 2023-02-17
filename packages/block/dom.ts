/* eslint-disable @typescript-eslint/unbound-method */

const EVENT_LISTENERS_POOL = '__million_listeners';
const EVENTS_REGISTRY = '__million_events';
const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const XML_NS = 'http://www.w3.org/2000/xmlns/';
const X_CHAR = 120;
let listenerPointer = 0;
const propsToSkip = new Set(['href', 'list', 'form', 'tabIndex', 'download']);

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
export const innerHTML$ = Object.getOwnPropertyDescriptor(
  element$,
  'innerHTML',
)!.set!;
export const childNodes$ = Object.getOwnPropertyDescriptor(node$, 'childNodes')!
  .get!;

export const map$ = Map.prototype;
export const mapSet$ = map$.set;
export const mapHas$ = map$.has;
export const mapGet$ = map$.get;

export const set$ = Set.prototype;
export const setAdd$ = set$.add;
export const setHas$ = set$.has;

const eventCache = new Map<string, EventListener>();
export const createEventListener = (
  el: HTMLElement,
  name: string,
  value?: EventListener,
) => {
  const event = name.toLowerCase().slice(2);
  if (!document[EVENTS_REGISTRY]) document[EVENTS_REGISTRY] = new Set();
  if (!setHas$.call(document[EVENTS_REGISTRY], event)) {
    // createEventListener uses a synthetic event handler to capture events
    // https://betterprogramming.pub/whats-the-difference-between-synthetic-react-events-and-javascript-events-ba7dbc742294
    addEventListener$.call(
      document,
      event,
      (nativeEventObject: Event) => {
        let el = nativeEventObject.target as Node | null;
        // Bubble up the DOM tree to find all event listeners
        while (el) {
          const pool = el[EVENT_LISTENERS_POOL];
          if (pool) {
            const listeners = pool[event] as Record<string, any> | undefined;
            if (listeners) {
              const handlers = Object.values(listeners);
              let returnFalse = false;
              for (let i = 0, j = handlers.length; i < j; ++i) {
                if (handlers[i](nativeEventObject) === false) {
                  returnFalse = true;
                }
              }
              if (returnFalse) return;
            }
          }
          el = el.parentNode;
        }
      },
      {
        capture: false,
      },
    );
    document[EVENTS_REGISTRY].add(event);
  }
  const pointer = listenerPointer++;
  if (mapHas$.call(eventCache, value)) return mapGet$.call(eventCache, value);
  const patch = (newValue?: EventListener) => {
    if (!el[EVENT_LISTENERS_POOL]) el[EVENT_LISTENERS_POOL] = {};
    const pool = el[EVENT_LISTENERS_POOL];
    if (!pool[event]) pool[event] = {};
    pool[event][pointer] = (e: Event) => {
      (newValue ?? value)?.(e);
    };
  };
  patch(value);
  mapSet$.call(eventCache, value, patch);
  return patch;
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
  } else if (
    name in el &&
    el[name] !== undefined &&
    el[name] !== null &&
    !(el instanceof SVGElement) &&
    setHas$.call(propsToSkip, name)
  ) {
    try {
      el[name] = value;
    } catch (_err) {
      /**/
    }
  } else if (name.charCodeAt(0) === X_CHAR) {
    // Handle SVG namespaced attributes
    // eslint-disable-next-line prefer-named-capture-group
    name = name.replace(/xlink(H|:h)/, 'h').replace(/sName$/, 's');
    if (name.startsWith('xmlns')) {
      setAttributeNS$.call(el, XML_NS, name, String(value));
    } else if (name.startsWith('xlink')) {
      setAttributeNS$.call(el, XLINK_NS, 'href', String(value));
    }
  } else if (
    !isValueNully &&
    value !== '' &&
    (value !== false || name.includes('-'))
  ) {
    setAttribute$.call(el, name, String(value));
  } else {
    removeAttribute$.call(el, name);
  }
};
