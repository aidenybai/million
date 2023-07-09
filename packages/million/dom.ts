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

if (typeof window === 'undefined') {
  throw new Error(
    'See http://million.dev/docs/install to install the compiler.',
  );
}

export const document$ = document;
export const queueMicrotask$ = queueMicrotask;
export const template$ = document$.createElement('template');

// Taken from ivi (https://github.com/localvoid/ivi/blob/43cdf6f747dc782883ca73bdb5b4e21fa9c27655/packages/ivi/src/client/core.ts#L29C1-L29C1)
export const HTM_TEMPLATE = /**@__PURE__*/ document$.createElement('template');
export const HTM_TEMPLATE_CONTENT = HTM_TEMPLATE.content;
const _SVG_TEMPLATE = /**@__PURE__*/ document$.createElement('template');
export const SVG_TEMPLATE = /**@__PURE__*/ document$.createElementNS(
  'http://www.w3.org/2000/svg',
  'svg',
);
/**@__PURE__*/ _SVG_TEMPLATE.content.appendChild(SVG_TEMPLATE);
export const SVG_TEMPLATE_CONTENT = _SVG_TEMPLATE.content.firstChild as Element;

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
export const firstChild$ = getOwnPropertyDescriptor$(node$, 'firstChild')!.get!;
export const nextSibling$ = getOwnPropertyDescriptor$(node$, 'nextSibling')!
  .get!;
export const characterDataSet$ = getOwnPropertyDescriptor$(
  characterData$,
  'data',
)!.set!;

document$[EVENTS_REGISTRY] = new Set$();

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
    addEventListener$.call(document$, event, (nativeEvent: Event) => {
      nativeEvent.stopPropagation = () => {
        nativeEvent.cancelBubble = true;
        nativeEvent.stopImmediatePropagation();
      };

      requestAnimationFrame(() => {
        let el = nativeEvent.target as Node | null;
        // Bubble up the DOM tree to find all event listeners
        while (el) {
          const handler = el[key];
          if (handler) {
            Object.defineProperty(nativeEvent, 'currentTarget', {
              configurable: true,
              get() {
                return el;
              },
            });
            handler(nativeEvent);
          }
          el = el.parentNode;
        }
      });
    });
    SetAdd$.call(document$[EVENTS_REGISTRY], event);
  }
  const patch = (newValue?: EventListener | null) => {
    if (!newValue) {
      el[key] = null;
    } else if (!('key' in newValue && newValue.key === el[key]?.key)) {
      el[key] = newValue;
    }
  };
  patch(value);
  return patch;
};

// https://www.measurethat.net/Benchmarks/Show/15652/0/childnodes-vs-children-vs-firstchildnextsibling-vs-firs
export const childAt = (el: HTMLElement, index: number) => {
  let child = firstChild$.call(el);
  if (index) {
    for (let j = 0; j < index; ++j) {
      if (!child) break;
      child = nextSibling$.call(child);
    }
  }
  return child;
};

export const insertText = (
  el: HTMLElement,
  value: any,
  index: number,
): Text => {
  const node = document$.createTextNode(value);
  const child = childAt(el, index);
  insertBefore$.call(el, node, child);
  return node;
};

export const setText = (el: Text, value: string) => {
  characterDataSet$.call(el, value);
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
