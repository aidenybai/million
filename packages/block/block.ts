import { entity } from '../million/m';
import { VEntity } from '../million/types';
import { fromDomNodeToVNode, fromStringToDomNode } from '../shared/convert';

const cache = new Map<string, VEntity>();

export const block = (html: string): VEntity => {
  if (cache.has(html)) {
    return cache.get(html)!;
  } else {
    const el = fromStringToDomNode(html);
    const vnode = fromDomNodeToVNode(el)!;
    const blockEntity = entity(
      {
        get el() {
          return el.cloneNode(true);
        },
        key: html,
      },
      () => vnode,
    );
    cache.set(html, blockEntity);
    return blockEntity;
  }
};
