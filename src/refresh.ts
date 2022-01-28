/* eslint-disable @typescript-eslint/ban-types */
import { toVNode as toVNodeDefault } from './m';
import { patch } from './render';
import { VNode, Driver, OLD_VNODE_FIELD } from './types/base';

const parser = new DOMParser();
const cache = new Map<string, VNode>();

export const getCache = (el: HTMLElement, key: string, toVNode: Function): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = <VNode>toVNode(el);
    cache.set(key, vnode);
    return vnode;
  }
};

export const noRefreshCommit = (work: () => void, data: ReturnType<Driver>) => {
  // @ts-expect-error Avoid re-fetching their contents of <link> and <script>
  const newVNodeTag = data.newVNode?.tag;
  // @ts-expect-error Avoid re-fetching their contents of <link> and <script>
  const oldVNodeTag = data.oldVNode?.tag;
  if (
    newVNodeTag !== 'link' &&
    oldVNodeTag !== 'link' &&
    newVNodeTag !== 'script' &&
    oldVNodeTag !== 'script'
  ) {
    work();
  }
};

export const refresh = (html: string, toVNode: Function = toVNodeDefault) => {
  const { head, body } = parser.parseFromString(html, 'text/html');

  patch(
    document.head,
    getCache(head, head.innerHTML, toVNode),
    document.head[OLD_VNODE_FIELD],
    [],
    noRefreshCommit,
  );
  patch(
    document.body,
    getCache(body, body.innerHTML, toVNode),
    document.body[OLD_VNODE_FIELD],
    [],
    noRefreshCommit,
  );
};
