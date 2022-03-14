/**
 * @name removeRow
 * @description removing one row
 */
// @ts-nocheck

import { createElement, Deltas } from 'packages/million';
import * as simple_virtual_dom from 'simple-virtual-dom';
import * as snabbdom from 'snabbdom';
import * as hundred from 'hundred';
import * as virtual_dom from 'virtual-dom';
import { Suite, vnodeAdapter } from '../benchmark';
import { buildData, patch } from '../data';

const data = buildData(1000);
const oldVNode = (
  <table>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const el = () => createElement(oldVNode);
const row = Math.floor(Math.random() * (data.length + 1));
data.splice(row, 1);

const vnode = (
  <table delta={[Deltas.DELETE(row)]}>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('remove row (removing one row)', {
  million: () => {
    patch(el(), vnode);
  },
  hundred: () => {
    hundred.patch(el(), vnodeAdapter(vnode), vnodeAdapter(oldVNode));
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
    const elClone = el();
    elClone.removeChild(elClone.childNodes.item(row));
  },
  innerHTML: () => {
    const element = el();
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i) return;
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    element.innerHTML = html;
  },
});

export default suite;
