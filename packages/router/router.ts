import { patch } from '../million/render';
import { VElement } from '../million/types';
import { morph } from '../morph/morph';
import { Controller, Route } from './types';
import { getURL, normalizeRelativeURLs } from './utils';

const parser = new DOMParser();
const routeMap = new Map<string, Route>();

export const setRoute = (path: string, route: Route) => {
  routeMap.set(path, { ...routeMap.get(path), ...route });
};

export const createRoute = (vnode: VElement, hook: (url: URL) => boolean = () => true) => ({
  vnode,
  hook,
});

export const getEl = (el: HTMLElement, selector?: string): HTMLElement => {
  return selector ? el.querySelector<HTMLElement>(selector)! : el;
};

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

export const navigate = async (
  url: URL,
  selector?: string,
  opts?: RequestInit,
  goBack = false,
): Promise<void> => {
  if (!goBack) {
    history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  }

  if (routeMap.has(url.pathname)) {
    const route = routeMap.get(url.pathname)!;

    if (route.vnode) {
      patch(getEl(document.documentElement, selector), route.vnode);
    } else if (route.html) {
      morph(getEl(route.html.documentElement, selector), getEl(document.documentElement, selector));
      if (selector) document.title = route.html.title;
    }
  } else {
    const content = await getContent(url, opts);
    if (!content) return;

    const html = parseContent(content, url);

    setRoute(url.pathname, { html });

    if (selector) document.title = html.title;

    morph(getEl(html.documentElement, selector), getEl(document.documentElement, selector));
  }
};

export const router = (selector?: string, routes: Record<string, Route> = {}): Controller => {
  for (const path in routes) {
    setRoute(path, routes[path]);
  }

  window.addEventListener('click', (event) => {
    const url = getURL(event);
    if (!url) return;
    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;
    event.preventDefault();
    try {
      navigate(url, selector);
    } catch (_err) {
      window.location.assign(url);
    }
  });

  window.addEventListener('mouseover', async (event) => {
    const url = getURL(event);
    if (!url) return;
    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;
    event.preventDefault();
    if (routeMap.has(url.pathname)) return;
    const content = await getContent(url);
    if (content) {
      const html = parseContent(content, url);
      setRoute(url.pathname, { html });
    }
  });

  window.addEventListener('submit', async (event) => {
    const el = event.target as HTMLFormElement;
    const url = new URL(el.action);
    if (!el.action || !(el instanceof HTMLFormElement)) return;
    const route = routeMap.get(el.action);
    if (route && route.hook && !route.hook(url, route)) return;

    event.stopPropagation();
    event.preventDefault();

    const formData = new FormData(el);
    const body = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    navigate(url, selector, {
      method: el.method,
      redirect: 'follow',
      body:
        !el.method || el.method.toLowerCase() === 'get'
          ? `?${new URLSearchParams(body)}`
          : JSON.stringify(body),
    });
  });

  window.addEventListener('popstate', () => {
    const url = new URL(window.location.toString());
    if (window.location.hash) return;
    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;

    try {
      navigate(url, selector, {}, true);
    } catch (e) {
      window.location.reload();
    }
    return;
  });

  const controller: Controller = {
    setRoute: (path: string, vnode: VElement) => {
      routeMap.set(path, { vnode });
      return controller;
    },
    removeRoute: (path: string) => {
      routeMap.delete(path);
      return controller;
    },
  };
  return controller;
};
