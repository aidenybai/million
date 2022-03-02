import { normalizeRelativeURLs } from './utils';
import { fromDomNodeToVNode } from '../shared/convert';
import { patch } from '../million/render';
import { OLD_VNODE_FIELD } from '../million/types';
import { getURL } from './utils';

const parser: DOMParser = new DOMParser();

export const navigate = async (url: URL, isBack = false) => {
  if (!isBack) {
    history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  }
  const newPageHtmlString = await fetch(String(url))
    .then((res) => res.text())
    .catch(() => {
      window.location.assign(url);
    });
  if (!newPageHtmlString) return;
  updatePage(newPageHtmlString, url);
};

export const updatePage = (htmlString: string, url: URL) => {
  const html = parser.parseFromString(htmlString, 'text/html');
  normalizeRelativeURLs(html, url);

  if (!document.head[OLD_VNODE_FIELD]) {
    document.head[OLD_VNODE_FIELD] = fromDomNodeToVNode(document.head);
  }
  if (!document.body[OLD_VNODE_FIELD]) {
    document.body[OLD_VNODE_FIELD] = fromDomNodeToVNode(document.body);
  }

  patch(document.head, fromDomNodeToVNode(html.head));
  patch(document.body, fromDomNodeToVNode(html.body));
};

export const router = (routes?: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    const routesMap = new Map();
    if (routes) {
      for (const route in routes) {
        routesMap.set(new URL(route).pathname, routes[route]);
      }
    }

    window.addEventListener('click', (event) => {
      const url = getURL(event);
      if (!url) return;
      event.preventDefault();
      try {
        if (routesMap.has(url)) {
          updatePage(routesMap.get(url), url);
        } else {
          navigate(url);
        }
      } catch (e) {
        window.location.assign(url);
      }
    });

    window.addEventListener('popstate', () => {
      if (window.location.hash) return;
      try {
        navigate(new URL(window.location.toString()), true);
      } catch (e) {
        window.location.reload();
      }
      return;
    });
  }
};
