/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */
// @ts-nocheck

import * as hundred from 'hundred';
import { createElement, Deltas } from 'packages/million';
import * as simple_virtual_dom from 'simple-virtual-dom';
import * as snabbdom from 'snabbdom';
import * as virtual_dom from 'virtual-dom';
import {
  hundredAdapter,
  simpleVirtualDomAdapter,
  snabbdomAdapter,
  Suite,
  millionAdapter,
  virtualDomAdapter,
} from '../benchmark';
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

const row1 = 0;
const row2 = 1;
const temp = data[row1];
data[row1] = data[row2];
data[row2] = temp;

const vnode = (
  <table delta={[Deltas.UPDATE(row1), Deltas.UPDATE(row2)]}>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('swap rows (swap 2 rows for table with 1,000 rows)', {
  million: () => {
    patch(el(), millionAdapter(vnode), millionAdapter(oldVNode));
  },
  hundred: () => {
    hundred.patch(el(), hundredAdapter(vnode), hundredAdapter(oldVNode));
  },
  'simple-virtual-dom': () => {
    const patches = simple_virtual_dom.diff(
      simpleVirtualDomAdapter(oldVNode),
      simpleVirtualDomAdapter(vnode),
    );
    simple_virtual_dom.patch(el(), patches);
  },
  'virtual-dom': () => {
    const patches = virtual_dom.diff(
      virtualDomAdapter(oldVNode),
      virtualDomAdapter(vnode),
    );
    virtual_dom.patch(el(), patches);
  },
  snabbdom: () => {
    const patch = snabbdom.init([]);
    patch(snabbdom.toVNode(el()), snabbdomAdapter(vnode));
  },
  DOM: () => {
    const elClone = el();
    const tr1 = elClone.childNodes.item(row1);
    const tr2 = elClone.childNodes.item(row2);
    elClone.replaceChild(tr1.cloneNode(true), tr2);
    elClone.replaceChild(tr2.cloneNode(true), tr1);
  },
  innerHTML: () => {
    const element = el();
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    element.innerHTML += html;
  },
});

export default suite;
