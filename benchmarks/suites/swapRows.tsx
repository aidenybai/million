/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */
// @ts-nocheck

import { createElement, Delta } from 'packages/million';
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
    const tr1 = elClone.childNodes.item(row1);
    const tr2 = elClone.childNodes.item(row2);
    elClone.replaceChild(tr1.cloneNode(true), tr2);
    elClone.replaceChild(tr2.cloneNode(true), tr1);
  },
  innerHTML: () => {
    const element = el();
    data.forEach(({ id, label }) => {
      element.innerHTML += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
  },
});

export default suite;
