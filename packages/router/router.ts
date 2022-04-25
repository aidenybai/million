import { m } from '../million/m';
import { patch } from '../million/render';
import { VElement } from '../million/types';
import { morph } from '../morph/morph';
import { fromDomNodeToVNode } from '../shared/convert';
import { getURL, normalizeRelativeURLs } from './utils';

const parser = new DOMParser();
const routesMap = new Map<string, VElement>();
const listeners = new Map<string, (() => any)[]>();

export const parsePageContent = (content: string, url: URL): Document => {
  const html = parser.parseFromString(content, 'text/html');
  normalizeRelativeURLs(html, url);
  return html;
};

export const getPageContent = async (
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
  if (listeners.has(url.pathname)) {
    const currentListeners = listeners.get(url.pathname)!;
    for (let i = 0; i < currentListeners.length; i++) {
      currentListeners[i]();
    }
  }

  if (!goBack) {
    history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  }

  if (routesMap.has(url.pathname)) {
    const vnode = routesMap.get(url.pathname)!;
    if (!vnode.children) return;
    const [head, body] = vnode.children;

    if (head) patch(document.head, head);
    if (body) patch(document.body, body);
  } else {
    const content = await getPageContent(url, opts);
    if (!content) return;

    const html = parsePageContent(content, url);

    morph(html.head, document.head);
    morph(html.body, document.body);
  }
};

export const router = (routes?: Record<string, VElement>) => {
  for (const route in routes) {
    routesMap.set(route, routes[route]);
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
    if (routesMap.has(url.pathname)) return;
    const content = await getPageContent(url);
    if (content) {
      const html = parsePageContent(content, url);
      const vnode = m('html', undefined, [
        fromDomNodeToVNode(html.head)!,
        fromDomNodeToVNode(html.body)!,
      ]);
      routesMap.set(url.pathname, vnode);
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

  const controller = {
    on: (path: string, listener: () => any) => {
      if (listeners.has(path)) {
        listeners.set(path, [listener, ...listeners.get(path)!]);
      } else {
        listeners.set(path, [listener]);
      }
      return controller;
    },
    off: (path: string, listener: () => any) => {
      const currentListeners = listeners.get(path)!;
      listeners.set(
        path,
        currentListeners.filter((l) => l !== listener),
      );
      return controller;
    },
    add: (path: string, vnode: VElement) => {
      routesMap.set(path, vnode);
      return controller;
    },
    remove: (path: string) => {
      routesMap.delete(path);
      return controller;
    },
  };
  return controller;
};
