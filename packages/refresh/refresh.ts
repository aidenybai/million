/* eslint-disable @typescript-eslint/ban-types */
import { toVNode as toVNodeDefault } from '../million/m';
import { patch } from '../million/render';
import { Driver } from '../million/types';
import { memo } from './memo';

const parser = new DOMParser();

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

  patch(document.head, memo(head, head.innerHTML, toVNode), undefined, [], noRefreshCommit);
  patch(document.body, memo(body, body.innerHTML, toVNode), undefined, [], noRefreshCommit);
};
