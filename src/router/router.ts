import { createElement } from '../million/createElement';
import { patch } from '../million/render';
import { VElement } from '../million/types';
import { morph } from '../morph/morph';
import { createProgressBar, startTrickle, stopTrickle } from './progress';
import { Route } from './types';
import { getURL, normalizeRelativeURLs } from './utils';

const parser = new DOMParser();
const routeMap = new Map<string, Route>();
const progressBar = createProgressBar();
let lastUrl: URL | undefined;

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
  scroll = 0,
): Promise<void> => {
  if (!goBack) {
    history.pushState({ scroll: document.documentElement.scrollTop }, '', url);
  } else {
    startTrickle(progressBar);
  }

  lastUrl = url;
  const currentEl = getEl(document.documentElement, selector);

  if (window.location.hash) {
    const anchor = document.querySelector<HTMLElement>(window.location.hash);
    if (anchor) anchor.scrollIntoView();
  } else {
    window.scrollTo({ top: scroll });
  }

  if (routeMap.has(url.pathname)) {
    const route = routeMap.get(url.pathname)!;

    if (route.vnode) {
      try {
        patch(currentEl, route.vnode);
      } catch (_err) {
        const el = route.html
          ? getEl(route.html.documentElement, selector)
          : createElement(route.vnode);
        currentEl.replaceWith(el);
      }
    } else if (route.html) {
      const newEl = getEl(route.html.documentElement, selector);
      if (selector) document.title = route.html.title;
      try {
        morph(newEl, currentEl);
      } catch (_err) {
        currentEl.replaceWith(newEl);
      }
    }
  } else {
    const content = await getContent(url, opts);
    if (!content) return;

    const html = parseContent(content, url);

    setRoute(url.pathname, { html });

    if (selector) document.title = html.title;

    const newEl = getEl(html.documentElement, selector);
    try {
      morph(newEl, currentEl);
    } catch (_err) {
      currentEl.replaceWith(newEl);
    }
  }

  const navigateEvent = new CustomEvent('million:navigate', { detail: { url } });

  window.dispatchEvent(navigateEvent);

  if (!goBack) stopTrickle(progressBar);
};

export const router = (
  selector?: string,
  routes: Record<string, Route> = {},
): Map<string, Route> => {
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
    if (routeMap.has(url.pathname)) return;
    const route = routeMap.get(url.pathname)!;
    if (route.hook && !route.hook(url, route)) return;
    event.preventDefault();
    prefetch(url);
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

  window.addEventListener('popstate', (event: PopStateEvent) => {
    const url = new URL(window.location.toString());

    if (url.hash && url.pathname === lastUrl?.pathname) {
      lastUrl = url;
      return;
    }

    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;

    try {
      navigate(url, selector, {}, true, event.state?.scroll);
    } catch (_err) {
      window.location.reload();
    }
  });

  return routeMap;
};

export const prefetch = async (path: string | URL) => {
  const url = typeof path === 'string' ? new URL(path) : path;
  if (routeMap.has(url.pathname)) return;
  const content = await getContent(url);
  if (content) {
    const html = parseContent(content, url);
    setRoute(url.pathname, { html });
  }
};

export const reload = (callback: () => any, delay = 0) => {
  window.addEventListener('million:navigate', () => {
    setTimeout(() => requestAnimationFrame(callback), delay);
  });
};
