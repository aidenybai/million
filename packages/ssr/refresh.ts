/* eslint-disable @typescript-eslint/ban-types */
import { OLD_VNODE_FIELD } from 'packages/million';
import { patch } from '../million/render';
import { fromDomNodeToVNode } from './convert';
import { memo } from './memo';

export const refresh = (head?: string, body?: string) => {
  if (!document.head[OLD_VNODE_FIELD]) {
    document.head[OLD_VNODE_FIELD] = fromDomNodeToVNode(document.head);
  }
  if (!document.body[OLD_VNODE_FIELD]) {
    document.body[OLD_VNODE_FIELD] = fromDomNodeToVNode(document.body);
  }

  if (head) patch(document.head, memo(head));
  if (body) patch(document.body, memo(body));
};
