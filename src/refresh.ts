/* eslint-disable @typescript-eslint/ban-types */
import { toVNode } from './m';
import { patch } from './render';
import { VNode, Driver, DOMNode, OLD_VNODE_FIELD } from './types/base';

const parser = new DOMParser();
const temp = document.createElement('div');
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

export const toVNodeFromHTML = (el: string | DOMNode): VNode[] | VNode => {
  if (typeof el === 'string') {
    temp.innerHTML = el;
    const vnodes: (string | VNode)[] = new Array(temp.childNodes.length).fill(0);
    for (let i = 0; i < temp.childNodes.length; ++i) {
      vnodes[i] = <VNode>toVNodeFromHTML(<string | DOMNode>temp.childNodes[i])!;
    }
    return vnodes;
  } else {
    return <VNode>toVNode(el);
  }
};

export const refresh = (html: string, toVNode: Function = toVNodeFromHTML) => {
  const { head, body } = parser.parseFromString(html, 'text/html');

  patch(
    document.head,
    getCache(head, head.innerHTML, toVNode),
    head[OLD_VNODE_FIELD],
    [],
    noRefreshCommit,
  );
  patch(
    document.body,
    getCache(body, body.innerHTML, toVNode),
    body[OLD_VNODE_FIELD],
    [],
    noRefreshCommit,
  );
};
