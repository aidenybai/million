/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, UPDATE } from '../../src/index';
import { buildData } from '../data';

const el1 = document.createElement('table');
const data1 = buildData(1000);
data1.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', undefined, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});

const row1 = 0;
const row2 = 1;
const temp = data1[row1];
data1[row1] = data1[row2];
data1[row2] = temp;

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

const suite = new benchmark.Suite('swap rows | swap 2 rows for table with 1,000 rows');

const hoistedVNode = m(
  'table',
  undefined,
  data1.map(({ id, label }) => {
    return m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]);
  }),
  VFlags.ANY_CHILDREN,
  [UPDATE(row1), UPDATE(row2)],
);

suite
  .add('million', () => {
    patch(el1, hoistedVNode);
  })
  .add('vanilla', () => {
    const tr1 = el2.children[row1];
    const tr2 = el2.children[row2];
    el2.replaceChild(tr1.cloneNode(true), tr2);
    el2.replaceChild(tr2.cloneNode(true), tr1);
  });

export default suite;
