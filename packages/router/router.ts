import { createElement } from '../million/create-element';
import { patch } from '../million/render';
import { batch, startTransition } from '../million/scheduler';
import { morph } from '../morph/morph';
import { createProgressBar, startTrickle, stopTrickle } from './progress';
import { getURL, normalizeRelativeURLs } from './utils';
import type { Route } from './types';
import type { VElement } from '../million/types';

const parser = new DOMParser();
const routeMap = new Map<string, Route>();
const controllerMap = new Map<
  string,
  { controller: AbortController; pendingContent: Promise<string> }
>();
const PROGRESS_BAR_COLOR = getComputedStyle(document.body).getPropertyValue(
  '--million-progress-bar-color',
);
const progressBar = createProgressBar(PROGRESS_BAR_COLOR || '#0076ff');
let lastUrl: URL | undefined;
let applyFunction: ((doc: Document, url: URL) => void) | undefined;

export const queueNavigation = batch();
export const queuePrefetch = batch();

export const setRoute = (path: string, route: Route) => {
  routeMap.set(path, { ...routeMap.get(path), ...route });
};

export const getRoute = (path: string) => routeMap.get(path);

export const createRoute = (
  vnode: VElement,
  hook: (url: URL) => boolean = () => true,
) => ({
  vnode,
  hook,
});

export const getEl = (el: HTMLElement, selector?: string): HTMLElement => {
  return selector ? el.querySelector<HTMLElement>(selector) ?? el : el;
};

export const apply = (fn: (doc: Document, url: URL) => void) => {
  applyFunction = fn;
};

export const parseContent = (content: string, url: URL): Document => {
  const html = parser.parseFromString(content, 'text/html');
  normalizeRelativeURLs(html, url);
  if (applyFunction) applyFunction(html, url);
  return html;
};

export const request = async (
  url: URL | string,
  options?: RequestInit,
): Promise<string> => {
  return fetch(String(url), options)
    .then((res) => res.text())
    .catch((err: Error) => {
      if (err.name !== 'AbortError') {
        window.location.assign(url);
      }
      return err.name;
    });
};

export const prefetchDOM = (selector?: string) => {
  startTransition(() => {
    const root = getEl(document.documentElement, selector);
    for (const el of Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a'),
    )) {
      const url = getURL({ target: el } as unknown as Event);
      if (!url) return;
      if (routeMap.has(url.pathname)) return;
      startTransition(() => {
        void prefetch(url);
      });
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
    const content = await (pendingContent ?? request(url, opts));
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

  const navigateEvent = new CustomEvent('million:navigate', {
    detail: { url },
  });

  requestAnimationFrame(() => {
    if (window.location.hash) {
      const anchor = document.querySelector<HTMLElement>(
        `[href="${window.location.hash}"]`,
      );
      if (anchor) anchor.scrollIntoView();
    } else {
      window.scrollTo({ top: scroll });
    }
    window.dispatchEvent(navigateEvent);
    if (!goBack) {
      stopTrickle(progressBar);
      prefetchDOM(selector);
    }
  });
};

export const router = (
  selector?: string,
  routes: Record<string, Route> = {},
): (() => void) => {
  for (const path in routes) {
    setRoute(path, routes[path]!);
  }

  if (!routeMap.has(window.location.pathname)) {
    const html = parseContent(
      document.documentElement.outerHTML,
      new URL(window.location.href),
    );
    if (applyFunction) applyFunction(html, new URL(window.location.href));
    setRoute(window.location.pathname, { html });
  }

  const clickHandler = (event: Event) => {
    const url = getURL(event);
    if (!url) return;
    const route = routeMap.get(url.pathname);
    if (route?.hook?.(url, route) === false) return;
    event.preventDefault();
    try {
      queueNavigation(() => navigate(url, selector));
    } catch (_err) {
      window.location.assign(url);
    }
  };

  const mouseoverHandler = (event: Event) => {
    const url = getURL(event);
    if (!url) return;
    if (routeMap.has(url.pathname)) return;
    event.preventDefault();
    queuePrefetch(() => prefetch(url));
  };

  const submitHandler = (event: Event) => {
    const el = event.target as HTMLFormElement;
    const url = new URL(el.action);
    if (!el.action || !(el instanceof HTMLFormElement)) return;
    const route = routeMap.get(el.action);
    if (route?.hook?.(url, route) === false) return;

    event.stopPropagation();
    event.preventDefault();

    const formData = new FormData(el);
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = String(value);
    });

    queueNavigation(() => {
      void navigate(url, selector, {
        method: el.method,
        redirect: 'follow',
        body:
          !el.method || el.method.toLowerCase() === 'get'
            ? `?${new URLSearchParams(body).toString()}`
            : JSON.stringify(body),
      });
    });
  };

  const popstateHandler = () => {
    const url = new URL(window.location.toString());

    if (url.hash && url.pathname === lastUrl?.pathname) {
      lastUrl = url;
      return;
    }

    const route = routeMap.get(url.pathname);
    if (route?.hook?.(url, route) === false) return;

    try {
      queueNavigation(() => {
        void navigate(url, selector, {}, true);
      });
    } catch (_err) {
      window.location.reload();
    }
  };

  prefetchDOM(selector);

  window.addEventListener('click', clickHandler);
  window.addEventListener('mouseover', mouseoverHandler);
  window.addEventListener('submit', submitHandler);
  window.addEventListener('popstate', popstateHandler);

  return () => {
    window.removeEventListener('click', clickHandler);
    window.removeEventListener('mouseover', mouseoverHandler);
    window.removeEventListener('submit', submitHandler);
    window.removeEventListener('popstate', popstateHandler);
    routeMap.clear();
    controllerMap.clear();
    lastUrl = undefined;
    stopTrickle(progressBar);
  };
};

export const prefetch = async (path: string | URL) => {
  const url = typeof path === 'string' ? new URL(path) : path;
  if (routeMap.has(url.pathname)) return;

  const controller = new AbortController();
  const pendingContent = request(url, { signal: controller.signal });
  controllerMap.set(url.pathname, { controller, pendingContent });

  const content = await pendingContent;
  controllerMap.delete(url.pathname);
  if (content) {
    const html = parseContent(content, url);
    setRoute(url.pathname, { html });
  }
};
