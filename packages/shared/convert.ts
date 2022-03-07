import { DOMNode, Flags, OLD_VNODE_FIELD, VNode, VProps } from '../million/types';
import { h } from './h';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromNodeToVNode = (node: any): VNode => {
  const vnode =
    node.type === 'tag'
      ? h(node.name, node.attribs, ...node.children.map(fromNodeToVNode))
      : node.type === 'text'
      ? node.data
      : '';

  if (vnode.props?.ignore !== undefined && vnode.props?.ignore !== null) {
    vnode.flag = Flags.IGNORE_NODE;
  }

  return vnode;
};

export const fromDomNodeToVNode = (el: DOMNode): VNode | undefined => {
  if (el[OLD_VNODE_FIELD]) return el[OLD_VNODE_FIELD];
  if (el instanceof Text) return String(el.nodeValue);
  if (el instanceof Comment) return undefined;

  const props: VProps = {};
  // We know children length, so we created a fixed array
  const children = new Array(el.children.length).fill(0);
  for (let i = 0; i < el.attributes.length; i++) {
    const { nodeName, nodeValue } = el.attributes[i];
    props[nodeName] = nodeValue;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    children[i] = fromDomNodeToVNode(<DOMNode>el.childNodes.item(i));
  }

  const vnode = h(el.tagName.toLowerCase(), props, ...children);
  el[OLD_VNODE_FIELD] = vnode;
  return vnode;
};

export const fromStringToDomNode = (html: string): DOMNode => {
  const doc = new DOMParser().parseFromString(`<t>${html.trim()}</t>`, 'text/xml');
  const el = <DOMNode>doc.firstChild!.firstChild!;
  return el;
};

export const fromVNodeToString = (vnode: VNode): string => {
  if (typeof vnode === 'string') return vnode;
  if (!vnode.tag) return '<!-- -->';
  const props = vnode.props ?? {};
  const children = vnode.props ?? [];
  const startTag = `<${vnode.tag}${props
    .map((prop: string) => ` ${prop}="${props[prop].toString()}"`)
    .join('')}>`;
  const childrenOfTag = typeof children === 'string' ? children : children.join('');
  const endTag = `</${vnode.tag}>`;
  return `${startTag}${childrenOfTag}${endTag}`;
};
