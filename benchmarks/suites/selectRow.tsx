/**
 * @name selectRow
 * @description highlighting a selected row
 */
// @ts-nocheck

import { createElement } from 'packages/million';
import * as simple_virtual_dom from 'simple-virtual-dom';
import * as snabbdom from 'snabbdom';
import * as tiny_vdom from 'tiny-vdom';
import * as virtual_dom from 'virtual-dom';
import { Suite, vnodeAdapter } from '../benchmark';
import { buildData, patch } from '../data';

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
const row = Math.floor(Math.random() * (data.length + 1));
const vnode = createVNode();

const suite = Suite('select row (highlighting a selected row)', {
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
    el().childNodes.item(row).style.background = 'red';
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i) html += `<tr style="background: red;"><td>${id}</td><td>${label}</td></tr>`;
      else html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
