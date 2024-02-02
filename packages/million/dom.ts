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
export const template$ = document$.createElement('template');

// Taken from ivi (https://github.com/localvoid/ivi/blob/43cdf6f747dc782883ca73bdb5b4e21fa9c27655/packages/ivi/src/client/core.ts#L29C1-L29C1)
//
// The MIT License (MIT)
//
// Copyright (c) 2016-2023 Boris Kaul <localvoid@gmail.com>.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
export const HTM_TEMPLATE = /**@__PURE__*/ document$.createElement('template');
export const HTM_TEMPLATE_CONTENT = HTM_TEMPLATE.content;
const _SVG_TEMPLATE = /**@__PURE__*/ document$.createElement('template');
export const SVG_TEMPLATE = /**@__PURE__*/ document$.createElementNS(
  'http://www.w3.org/2000/svg',
  'svg',
);
/**@__PURE__*/ _SVG_TEMPLATE.content.appendChild(SVG_TEMPLATE);

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

export const stringToDOM = (content: string, svg?: boolean) => {
  const template = svg ? SVG_TEMPLATE : HTM_TEMPLATE;
  template.innerHTML = content;
  const dom = svg ? SVG_TEMPLATE : HTM_TEMPLATE_CONTENT;
  return dom.firstChild as HTMLElement;
};

document$[EVENTS_REGISTRY] = new Set$();

export const createEventListener = (
  el: HTMLElement,
  name: string,
  value?: EventListener,
) => {
  let event = name.toLowerCase();
  let capture = false;
  if (event.endsWith('capture')) {
    event = event.slice(0, -7);
    capture = true;
  }

  const key = `$$${event}`;
  if (!SetHas$.call(document$[EVENTS_REGISTRY], event)) {
    // createEventListener uses a synthetic event handler to capture events
    // https://betterprogramming.pub/whats-the-difference-between-synthetic-react-events-and-javascript-events-ba7dbc742294
    addEventListener$.call(
      document$,
      event,
      (nativeEvent: Event) => {
        let el = nativeEvent.target as Node | null;
        // Bubble up the DOM tree to find all event listeners
        while (el) {
          const handler = el[key];
          if (handler) {
            Object$.defineProperty(nativeEvent, 'currentTarget', {
              configurable: true,
              get() {
                return el;
              },
            });
            handler(nativeEvent);
          }
          el = el.parentNode;
        }
      },
      { capture },
    );
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

const visitedNodes = new WeakSet<Node>();

// React removes the comment in hydration but since we're hijacking the hydration, we should do it manually
export const removeComments = (el: Node) => {
  if (visitedNodes.has(el)) {
    return;
  }
  if (el.nodeType === 8) {
    el.parentNode?.removeChild(el);
  }
  let child: ChildNode | null = firstChild$.call(el);
  while (child) {
    removeComments(child);
    child = child.nextSibling;
  }
  visitedNodes.add(el);
};

export const insertText = (
  el: HTMLElement,
  value: string,
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
  value?: string | boolean | number | null,
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

  const isInput = el instanceof HTMLInputElement;
  const isSelect = el instanceof HTMLSelectElement;
  const isTextArea = el instanceof HTMLTextAreaElement;

  if (name === 'value' && (isInput || isSelect || isTextArea)) {
    setAttribute$.call(el, name, String(value));
    el.value = value as string;
  }
};
