/**
 * @name partialUpdate
 * @description updating every 10th row for 1,000 rows
 */

import { createElement, patch, UPDATE } from '../../src/index';
import { Suite } from '../benchmark';
import { buildData } from '../data';
import * as tiny_vdom from '../tiny-vdom';
import * as virtual_dom from 'virtual-dom';
import * as snabbdom from 'snabbdom';

const data = buildData(1000);
const oldVNode = (
  <table>
    {data.map(({ id, label }) => (
      <tr key={String(id)}>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const el = () => createElement(oldVNode);
const delta = [];
for (let i = 0; i < 1000; i += 10) {
  data[i] = buildData(1)[0];
  delta.unshift(UPDATE(i));
}

const vnode = (
  <table>
    {data.map(({ id, label }) => (
      <tr key={String(id)}>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('partial update (updating every 10th row for 1,000 rows)', {
  million: () => {
    patch(el(), vnode);
  },
  'tiny-vdom': () => {
    tiny_vdom.patch(el(), vnode, oldVNode);
  },
  'virtual-dom': () => {
    const patches = virtual_dom.diff(clone(oldVNode), clone(vnode));
    virtual_dom.patch(el(), patches);
  },
  snabbdom: () => {
    const patch = snabbdom.init([snabbdom.propsModule]);
    patch(el(), clone(vnode));
  },
  DOM: () => {
    const elClone = el();
    for (let i = 0; i < 1000; i += 10) {
      const { id, label } = data[i];
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      elClone.replaceWith(tr);
    }
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
