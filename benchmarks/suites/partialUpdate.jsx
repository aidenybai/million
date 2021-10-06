/**
 * @name partialUpdate
 * @description updating every 10th row for 1,000 rows
 */

import { Suite } from '../benchmark';
import { createElement, patch, UPDATE } from '../../src/index';
import { buildData } from '../data';

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
const deltas = [];
for (let i = 0; i < 1000; i += 10) {
  deltas.push(UPDATE(i));
  data[i] = buildData(1)[0];
}

const vnode = (
  <table delta={deltas}>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('partial update (updating every 10th row for 1,000 rows)', {
  million: () => {
    patch(el(), vnode, oldVNode);
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
