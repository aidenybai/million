import { entity } from 'packages/million/m';
import { DOMNode, VEntity } from 'packages/million/types';
import { fromDomNodeToVNode } from '../shared/convert';

const cache = new Map<string, VEntity>();

export const block = (html: string): VEntity => {
  const doc = new DOMParser().parseFromString(`<t>${html.trim()}</t>`, 'text/xml');
  const el = <DOMNode>doc.firstChild!.firstChild!;
  const vnode = fromDomNodeToVNode(el)!;

  if (cache.has(html)) {
    return cache.get(html)!;
  } else {
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
