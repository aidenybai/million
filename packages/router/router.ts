import { patch } from '../million/render';
import { VElement } from '../million/types';
import { m } from '../million/m';
import { morph } from '../morph/morph';
import { fromDomNodeToVNode } from '../shared/convert';
import { getURL, normalizeRelativeURLs } from './utils';

const parser: DOMParser = new DOMParser();

export const fetchPage = async (url: URL): Promise<string | void> => {
  return fetch(String(url))
    .then((res) => res.text())
    .catch(() => {
      window.location.assign(url);
    });
};

export const navigate = async (url: URL, isBack = false, vnode?: VElement) => {
  if (!isBack) {
    history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  }

  if (vnode) {
    const [head, body] = vnode.children ?? [];
    if (head) patch(document.head, head);
    if (body) patch(document.body, body);
  } else {
    const newPageHtmlString = await fetchPage(url);

    if (!newPageHtmlString) return;

    const html = parser.parseFromString(newPageHtmlString, 'text/html');
    normalizeRelativeURLs(html, url);

    const title = html.head.querySelector('title');
    if (title) document.title = title.text;

    morph(html.head, document.head);
    morph(html.body, document.body);
  }
};

export const router = (routes?: Record<string, VElement>) => {
  if (typeof window !== 'undefined') {
    const routesMap = new Map();
    if (routes) {
      for (const route in routes) {
        routesMap.set(route, routes[route]);
      }
    }

    window.addEventListener('click', (event) => {
      const url = getURL(event);
      if (!url) return;
      event.preventDefault();
      try {
        navigate(url, false, routesMap.get(url.pathname));
      } catch (e) {
        window.location.assign(url);
      }
    });

    window.addEventListener('mouseover', async (event) => {
      const url = getURL(event);
      if (!url) return;
      event.preventDefault();
      if (routesMap.has(url.pathname)) return;
      const newPageHtmlString = await fetchPage(url);
      if (newPageHtmlString) {
        const html = parser.parseFromString(newPageHtmlString, 'text/html');
        const vnode = m('html', undefined, [
          fromDomNodeToVNode(html.head)!,
          fromDomNodeToVNode(html.body)!,
        ]);
        routesMap.set(url.pathname, vnode);
      }
    });

    window.addEventListener('popstate', () => {
      if (window.location.hash) return;
      const url = new URL(window.location.toString());
      try {
        navigate(url, true, routesMap.get(url.pathname));
      } catch (e) {
        window.location.reload();
      }
      return;
    });
  }
};
