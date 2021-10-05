/**
 * @name partialUpdate
 * @description updating every 10th row for 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, UPDATE, VFlags } from '../../src/index';
import { buildData } from '../data';

const data = buildData(1000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);
const el = createElement(oldVNode);
const deltas = [];
for (let i = 0; i < 1000; i += 10) {
  deltas.push(UPDATE(i));
  data[i] = buildData(1)[0];
}

const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ANY_CHILDREN,
  deltas,
);

const suite = new benchmark.Suite('partial update (updating every 10th row for 1,000 rows)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    const elClone = el.cloneNode(true);
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
  })
  .add('innerHTML', () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el.cloneNode(true).innerHTML = html;
  });

export default suite;
