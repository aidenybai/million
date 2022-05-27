import { createElement } from '../million/createElement';
import { patch } from '../million/render';
import { batch } from '../million/scheduler';
import { VElement } from '../million/types';
import { morph } from '../morph/morph';
import { createProgressBar, startTrickle, stopTrickle } from './progress';
import { Route } from './types';
import { getURL, normalizeRelativeURLs } from './utils';

const ONE_DAY = 86400000;
const FIVE_MINUTES = 300000;
const parser = new DOMParser();
const routeMap = new Map<string, Route>();
const controllerMap = new Map<
  string,
  { controller: AbortController; pendingContent: Promise<string | void> }
>();
const PROGRESS_BAR_COLOR = getComputedStyle(document.body).getPropertyValue(
  '--million-progress-bar-color',
);
const progressBar = createProgressBar(PROGRESS_BAR_COLOR || '#0076ff');
let lastUrl: URL | undefined;

export const queueNavigation = batch();
export const queuePrefetch = batch();

export const setRoute = (path: string, route: Route) => {
  routeMap.set(path, { ...routeMap.get(path), ...route });
};

export const getRoute = (path: string) => routeMap.get(path);

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

export const swr = async (
  url: URL | string,
  options?: RequestInit,
  controller: AbortController = new AbortController(),
  threshold = FIVE_MINUTES,
): Promise<string | void> => {
  const urlString = new URL(url).pathname;
  // Stale-while-revalidate strategy for fetching
  return fetch(urlString, {
    cache: 'only-if-cached',
    mode: 'same-origin',
    signal: controller.signal,
    ...options,
  })
    .catch((err) => {
      return err instanceof TypeError && err.message === 'Failed to fetch'
        ? undefined
        : Promise.reject(err);
    })
    .then((res) => {
      if (res === undefined || res.status === 504) {
        controller.abort();
        controller = new AbortController();
        controllerMap.delete(urlString);
        return fetch(urlString, {
          cache: 'force-cache',
          mode: 'same-origin',
          signal: controller.signal,
        });
      }

      const date = res.headers.has('date') ? new Date(res.headers.get('date')!).getTime() : 0;

      if (date < Date.now() - ONE_DAY) {
        controller.abort();
        controller = new AbortController();
        return fetch(urlString, {
          cache: 'reload',
          mode: 'same-origin',
          signal: controller.signal,
        });
      }

      if (date < Date.now() - threshold) {
        fetch(urlString, { cache: 'no-cache', mode: 'same-origin' });
      }

      return res;
    })
    .then((res) => res.text())
    .catch((err) => {
      if (err.name !== 'AbortError') {
        window.location.assign(url);
      }
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
    history.pushState({}, '', url);
    startTrickle(progressBar);
  }

  lastUrl = url;
  let pendingContent;
  const currentEl = getEl(document.documentElement, selector);

  for (const [path, prefetch] of controllerMap.entries()) {
    if (path !== url.pathname) {
      prefetch.controller.abort();
    } else {
      pendingContent = prefetch.pendingContent;
    }
  }
  controllerMap.clear();

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
    const content = await (pendingContent ?? swr(url, opts));
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

  requestAnimationFrame(() => {
    if (window.location.hash) {
      const anchor = document.querySelector<HTMLElement>(`[href="${window.location.hash}"]`);
      if (anchor) anchor.scrollIntoView();
    } else {
      window.scrollTo({ top: scroll });
    }
    window.dispatchEvent(navigateEvent);
  });

  if (!goBack) stopTrickle(progressBar);
};

export const router = (
  selector?: string,
  routes: Record<string, Route> = {},
): Map<string, Route> => {
  for (const path in routes) {
    setRoute(path, routes[path]);
  }

  if (!routeMap.has(window.location.pathname)) {
    const html = parseContent(document.documentElement.outerHTML, new URL(window.location.href));
    setRoute(window.location.pathname, { html });
  }

  window.addEventListener('click', (event) => {
    const url = getURL(event);
    if (!url) return;
    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;
    event.preventDefault();
    try {
      queueNavigation(() => navigate(url, selector));
    } catch (_err) {
      window.location.assign(url);
    }
  });

  window.addEventListener('mouseover', async (event) => {
    const url = getURL(event);
    if (!url) return;
    if (routeMap.has(url.pathname)) return;
    const route = routeMap.get(url.pathname)!;
    if (route && route.hook && !route.hook(url, route)) return;
    event.preventDefault();
    queuePrefetch(() => prefetch(url));
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

    queueNavigation(() => {
      navigate(url, selector, {
        method: el.method,
        redirect: 'follow',
        body:
          !el.method || el.method.toLowerCase() === 'get'
            ? `?${new URLSearchParams(body)}`
            : JSON.stringify(body),
      });
    });
  });

  window.addEventListener('popstate', () => {
    const url = new URL(window.location.toString());

    if (url.hash && url.pathname === lastUrl?.pathname) {
      lastUrl = url;
      return;
    }

    const route = routeMap.get(url.pathname);
    if (route && route.hook && !route.hook(url, route)) return;

    try {
      queueNavigation(() => {
        navigate(url, selector, {}, true);
      });
    } catch (_err) {
      window.location.reload();
    }
  });

  return routeMap;
};

export const prefetch = async (path: string | URL) => {
  const url = typeof path === 'string' ? new URL(path) : path;
  if (routeMap.has(url.pathname)) return;

  const controller = new AbortController();
  const pendingContent = swr(url, {}, controller);
  controllerMap.set(url.pathname, { controller, pendingContent });

  const content = await pendingContent;
  controllerMap.delete(url.pathname);
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
