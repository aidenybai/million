import { patch } from '../million/render';
import { VElement, VElementFlags, Flags } from '../million/types';
import { morph } from '../morph/morph';
import { fromDomNodeToVNode } from '../shared/convert';
import { Listener, Controller } from './types';
import { getURL, normalizeRelativeURLs } from './utils';

const parser = new DOMParser();
const routeMap = new Map<string, VElement>();
const listenerMap = new Map<string, Listener[]>();

export const parseContent = (content: string, url: URL): Document => {
  const html = parser.parseFromString(content, 'text/html');
  normalizeRelativeURLs(html, url);
  return html;
};

export const getContent = async (
  url: URL | string,
  options?: RequestInit,
): Promise<string | void> => {
  return fetch(String(url), options)
    .then((res) => res.text())
    .catch(() => {
      window.location.assign(url);
    });
};

export const navigate = async (url: URL, opts?: RequestInit, goBack = false): Promise<void> => {
  if (listenerMap.has(url.pathname)) {
    const currentListeners = listenerMap.get(url.pathname)!;
    for (let i = 0; i < currentListeners.length; i++) {
      currentListeners[i]({ url, opts, goBack });
    }
  }

  if (!goBack) {
    history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  }

  if (routeMap.has(url.pathname)) {
    const vnode = routeMap.get(url.pathname)!;
    if (!vnode.children) return;
    const [head, body] = vnode.children;

    if (head) patch(document.head, head);
    if (body) patch(document.body, body);
  } else {
    const content = await getContent(url, opts);
    if (!content) return;

    const html = parseContent(content, url);

    morph(html.head, document.head);
    morph(html.body, document.body);
  }
};

export const router = (routes?: Record<string, VElement>): Controller => {
  for (const route in routes) {
    routeMap.set(route, routes[route]);
  }

  window.addEventListener('click', (event) => {
    const url = getURL(event);
    if (!url) return;
    event.preventDefault();
    try {
      navigate(url);
    } catch (_err) {
      window.location.assign(url);
    }
  });

  window.addEventListener('mouseover', async (event) => {
    const url = getURL(event);
    if (!url) return;
    event.preventDefault();
    if (routeMap.has(url.pathname)) return;
    const content = await getContent(url);
    if (content) {
      const html = parseContent(content, url);

      routeMap.set(url.pathname, {
        tag: 'html',
        children: [fromDomNodeToVNode(html.head)!, fromDomNodeToVNode(html.body)!],
        flag: Flags.ELEMENT as VElementFlags,
      });
    }
  });

  window.addEventListener('submit', async (event) => {
    event.stopPropagation();
    event.preventDefault();

    const el = event.target;
    if (!(el instanceof HTMLFormElement)) return;

    const formData = new FormData(el);
    const body = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    navigate(new URL(el.action), {
      method: el.method,
      redirect: 'follow',
      body:
        !el.method || el.method.toLowerCase() === 'get'
          ? `?${new URLSearchParams(body)}`
          : JSON.stringify(body),
    });
  });

  window.addEventListener('popstate', () => {
    if (window.location.hash) return;
    const url = new URL(window.location.toString());
    try {
      navigate(url, {}, true);
    } catch (e) {
      window.location.reload();
    }
    return;
  });

  const controller: Controller = {
    on: (path: string, listener: Listener) => {
      if (listenerMap.has(path)) {
        listenerMap.set(path, [listener, ...listenerMap.get(path)!]);
      } else {
        listenerMap.set(path, [listener]);
      }
      return controller;
    },
    off: (path: string, listener: Listener) => {
      const currentListeners = listenerMap.get(path)!;
      listenerMap.set(
        path,
        currentListeners.filter((l) => l !== listener),
      );
      return controller;
    },
    add: (path: string, vnode: VElement) => {
      routeMap.set(path, vnode);
      return controller;
    },
    remove: (path: string) => {
      routeMap.delete(path);
      return controller;
    },
  };
  return controller;
};
