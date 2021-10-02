/**
 * @name partialUpdate
 * @description updating every 10th row for 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, UPDATE, VFlags } from '../../src/index';
import { buildData } from '../data';

const el1 = document.createElement('table');
const data1 = buildData(1000);
const deltas = [];
data1.forEach(({ id, label }) => {
  const row = createElement(
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});
for (let i = 0; i < 1000; i += 10) {
  deltas.push(UPDATE(0));
  data1[i] = buildData(1)[0];
}

const el2 = document.createElement('table');
const data2 = buildData(1000);
data2.forEach(({ id, label }) => {
  const tr = document.createElement('tr');
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  td1.textContent = String(id);
  td2.textContent = label;
  tr.appendChild(td1);
  tr.appendChild(td2);
  el2.appendChild(tr);
});

const suite = new benchmark.Suite('partial update');

const hoistedVNode = m(
  'table',
  undefined,
  data1.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ANY_CHILDREN,
  deltas,
);

suite
  .add('million', () => {
    patch(el1, hoistedVNode);
  })
  .add('vanilla', () => {
    for (let i = 0; i < 1000; i += 10) {
      const { id, label } = buildData(1)[0];
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      el2.replaceWith(tr);
    }
  });

export default suite;
