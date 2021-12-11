/**
 * @name replaceAllRows
 * @description updating all 1,000 rows
 */
// @ts-nocheck

import * as simple_virtual_dom from 'simple-virtual-dom';
import * as snabbdom from 'snabbdom';
import * as virtual_dom from 'virtual-dom';
import { createElement } from 'million';
import { Suite, vnodeAdapter } from '../benchmark';
import { buildData, patch } from '../data';
import * as tiny_vdom from '../tiny-vdom';

const shuffleArray = (array: unknown[]) => {
  for (
    let i = array.length - 1 - Math.floor(Math.random() * (data.length / 3 + 1));
    i > Math.floor(Math.random() * (data.length / 3 + 1));
    i--
  ) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const data = buildData(1000);
const createVNode = () => (
  <table>
    {data.map(({ id, label }) => (
      <tr key={String(id)}>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const oldVNode = createVNode();
const el = () => createElement(oldVNode);

shuffleArray(data);

const vnode = createVNode();

const suite = Suite('replace all rows (updating all 1,000 rows)', {
  million: () => {
    patch(el(), vnode);
  },
  'tiny-vdom': () => {
    tiny_vdom.patch(el(), vnodeAdapter(vnode), vnodeAdapter(oldVNode));
  },
  'simple-virtual-dom': () => {
    const patches = simple_virtual_dom.diff(vnodeAdapter(oldVNode), vnodeAdapter(vnode));
    simple_virtual_dom.patch(el(), patches);
  },
  'virtual-dom': () => {
    const patches = virtual_dom.diff(vnodeAdapter(oldVNode), vnodeAdapter(vnode));
    virtual_dom.patch(el(), patches);
  },
  snabbdom: () => {
    const patch = snabbdom.init([]);
    patch(snabbdom.toVNode(el()), vnodeAdapter(vnode));
  },
  DOM: () => {
    el().childNodes.forEach((tr, i) => {
      const { id, label } = data[i];
      tr.childNodes[0].textContent = String(id);
      tr.childNodes[1].textContent = label;
    });
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
