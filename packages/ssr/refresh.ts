/* eslint-disable @typescript-eslint/ban-types */
import { OLD_VNODE_FIELD } from 'packages/million';
import { patch } from '../million/render';
import { memo } from './memo';
import { domNodeToVNode } from './toVNode';

export const refresh = (head?: string, body?: string) => {
  if (!document.head[OLD_VNODE_FIELD]) {
    document.head[OLD_VNODE_FIELD] = domNodeToVNode(document.head);
  }
  if (!document.body[OLD_VNODE_FIELD]) {
    document.body[OLD_VNODE_FIELD] = domNodeToVNode(document.body);
  }

  if (head) patch(document.head, memo(head));
  if (body) patch(document.body, memo(body));
};
