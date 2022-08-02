/**
 * @name createRows
 * @description creating 1,000 rows
 */
// @ts-nocheck

import * as hundred from 'hundred';
import { createElement } from 'packages/million';
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

const data = buildData(10000);
const oldVNode = <table></table>;
const el = () => createElement(oldVNode);
const vnode = (
  <table>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('create rows (creating 1,000 rows)', {
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
    data.forEach(({ id, label }) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      elClone.appendChild(tr);
    });
  },
  innerHTML: () => {
    const element = el();
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    element.innerHTML = html;
  },
});

export default suite;
