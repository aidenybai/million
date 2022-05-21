import { DOMNode, OLD_VNODE_FIELD, VNode, VProps, Flags } from '../million/types';
import { h } from '../million/m';

export const fromDomNodeToVNode = (el: DOMNode): VNode | undefined => {
  if (el[OLD_VNODE_FIELD]) return el[OLD_VNODE_FIELD];
  if (el instanceof Text) return String(el.nodeValue);
  if (el instanceof Comment) return undefined;

  const props: VProps = {};
  // We know children length, so we created a fixed array
  const children = new Array(el.children.length).fill(0);
  for (let i = 0; i < el.attributes.length; i++) {
    const { nodeName, nodeValue } = el.attributes[i];
    props[nodeName] = nodeName === 'million-flag' ? Flags[nodeName] : nodeValue;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    children[i] = fromDomNodeToVNode(el.childNodes.item(i) as DOMNode);
  }

  const vnode = h(el.tagName.toLowerCase(), props, ...children);
  el[OLD_VNODE_FIELD] = vnode;
  return vnode;
};

export const fromStringToDomNode = (html: string): DOMNode => {
  const doc = new DOMParser().parseFromString(`<t>${html.trim()}</t>`, 'text/xml');
  const el = doc.firstChild!.firstChild! as DOMNode;
  return el;
};
