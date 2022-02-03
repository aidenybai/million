/* eslint-disable @typescript-eslint/ban-types */
import { toVNode as toVNodeDefault } from '../million/m';
import { patch } from '../million/render';
import { OLD_VNODE_FIELD } from '../million/types';
import { memo, needsPatch } from './memo';

const parser = new DOMParser();

export const refresh = (html: string, toVNode: Function = toVNodeDefault, cache = true) => {
  const { head, body } = parser.parseFromString(html, 'text/html');

  if (!document.head[OLD_VNODE_FIELD]) document.head[OLD_VNODE_FIELD] = toVNode(document.head);
  if (!document.body[OLD_VNODE_FIELD]) document.body[OLD_VNODE_FIELD] = toVNode(document.body);

  if (!cache || needsPatch(head.innerHTML)) {
    patch(document.head, cache ? memo(head, head.innerHTML, toVNode) : toVNode(head));
  }
  if (!cache || needsPatch(body.innerHTML)) {
    patch(document.body, cache ? memo(body, body.innerHTML, toVNode) : toVNode(body));
  }
};
