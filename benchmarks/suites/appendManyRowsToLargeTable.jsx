/**
 * @name appendManyRowsToLargeTable
 * @description appending 1,000 to a table of 10,000 rows.
 */

import { Suite } from '../benchmark';
import { createElement, patch } from '../../src/index';
import { buildData } from '../data';

const data = buildData(10000);
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
const vnode = createVNode();
data.push(...buildData(1000));

const suite = Suite('append many rows to large table (appending 1,000 to a table of 10,000 rows)', {
  million: () => {
    patch(el(), vnode);
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
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML += html;
  },
});

export default suite;
