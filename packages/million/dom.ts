/* eslint-disable @typescript-eslint/unbound-method */

import {
  EVENTS_REGISTRY,
  IS_NON_DIMENSIONAL,
  NON_PROPS,
  Object$,
  Set$,
  SetAdd$,
  SetHas$,
  XLINK_NS,
  XML_NS,
} from './constants';

export const document$ = document;
export const template$ = document$.createElement('template');

// Caching prototypes for performance
export const node$ = Node.prototype;
export const element$ = Element.prototype;
export const characterData$ = CharacterData.prototype;
export const getOwnPropertyDescriptor$ = Object$.getOwnPropertyDescriptor;
export const insertBefore$ = node$.insertBefore;
export const cloneNode$ = node$.cloneNode;
export const replaceChild$ = node$.replaceChild;
export const replaceWith$ = element$.replaceWith;
export const removeChild$ = node$.removeChild;
export const remove$ = element$.remove;
export const addEventListener$ = node$.addEventListener;
export const removeEventListener$ = node$.removeEventListener;
export const removeAttribute$ = element$.removeAttribute;
export const setAttribute$ = element$.setAttribute;
export const setAttributeNS$ = element$.setAttributeNS;
export const setTextContent$ = getOwnPropertyDescriptor$(node$, 'textContent')!
  .set!;
export const innerHTML$ = getOwnPropertyDescriptor$(element$, 'innerHTML')!
  .set!;
export const childNodes$ = getOwnPropertyDescriptor$(node$, 'childNodes')!.get!;
export const firstChild$ = getOwnPropertyDescriptor$(node$, 'firstChild')!.get!;
export const nextSibling$ = getOwnPropertyDescriptor$(node$, 'nextSibling')!
  .get!;
export const characterDataSet$ = getOwnPropertyDescriptor$(
  characterData$,
  'data',
)!.set!;

document$[EVENTS_REGISTRY] = new Set$();

let listenerPointer = 0;

// TODO: this consumes a lot of memory
export const createEventListener = (
  el: HTMLElement,
  name: string,
  value?: EventListener,
) => {
  const event = name.toLowerCase();
  const key = `$$${event}`;
  if (!SetHas$.call(document$[EVENTS_REGISTRY], event)) {
    // createEventListener uses a synthetic event handler to capture events
    // https://betterprogramming.pub/whats-the-difference-between-synthetic-react-events-and-javascript-events-ba7dbc742294
    addEventListener$.call(document$, event, (nativeEventObject: Event) => {
      let el = nativeEventObject.target as Node | null;
      // Bubble up the DOM tree to find all event listeners
      while (el) {
        const listeners = el[key] as Record<string, any> | undefined;
        if (listeners) {
          const handlers = Object$.values(listeners);
          let returnFalse = false;
          for (let i = 0, j = handlers.length; i < j; ++i) {
            if (handlers[i](nativeEventObject) === false) {
              returnFalse = true;
            }
          }
          if (returnFalse) return;
        }
        el = el.parentNode;
      }
    });
    SetAdd$.call(document$[EVENTS_REGISTRY], event);
  }
  const pointer = listenerPointer++;
  const patch = (newValue?: EventListener | null) => {
    if (!el[key]) el[key] = {};
    if (!newValue) return delete el[key][pointer];
    if ('key' in newValue && newValue.key === el[key][pointer]?.key) return;
    el[key][pointer] = newValue;
  };
  patch(value);
  return patch;
};

export const insertText = (
  el: HTMLElement,
  value: any,
  index: number,
): Text => {
  const node = document$.createTextNode(value);
  const childNodes = childNodes$.call(el);
  insertBefore$.call(el, node, childNodes[index]);
  return node;
};

export const setText = (el: HTMLElement, value: string, index: number) => {
  characterDataSet$.call(childNodes$.call(el)[index], value);
};

export const setStyleAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | boolean | null,
) => {
  if (typeof value !== 'number' || IS_NON_DIMENSIONAL.test(name)) {
    el.style[name] = value;
  } else if (typeof value === 'string') {
    el.style.cssText = value;
  } else if (name.startsWith('-')) {
    el.style.setProperty(name, String(value));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (value === undefined || value === null) {
    el.style[name] = '';
  } else {
    el.style[name] = `${String(value)}px`;
  }
};

export const setSvgAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | boolean | null,
) => {
  name = name.replace(/xlink(?:H|:h)/, 'h').replace(/sName$/, 's');
  if (name.startsWith('xmlns')) {
    setAttributeNS$.call(el, XML_NS, name, String(value));
  } else if (name.startsWith('xlink')) {
    setAttributeNS$.call(el, XLINK_NS, 'href', String(value));
  }
};

export const setAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | boolean | null,
): void => {
  const isValueNully = value === undefined || value === null;
  value = isValueNully ? '' : value;
  if (
    name in el &&
    el[name] !== undefined &&
    el[name] !== null &&
    !(el instanceof SVGElement) &&
    SetHas$.call(NON_PROPS, name)
  ) {
    try {
      el[name] = value;
    } catch (_err) {
      /**/
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
