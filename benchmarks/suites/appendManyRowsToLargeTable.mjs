/**
 * @name appendManyRowsToLargeTable
 * @description appending 1,000 to a table of 10,000 rows.
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const el1 = document.createElement('table');
const data1 = buildData(10000);
data1.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});
data1.push(...buildData(2 << 15));

const el2 = document.createElement('table');
const data2 = buildData(10000);
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

const suite = new benchmark.Suite('append many rows to large table');

suite
  .add('million', () => {
    patch(
      el1,
      m(
        'table',
        undefined,
        buildData(2 << 15).map(({ id, label }) =>
          m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
        ),
        VFlags.ONLY_KEYED_CHILDREN,
      ),
    );
  })
  .add('vanilla', () => {
    buildData(2 << 15).forEach(({ id, label }) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      el2.appendChild(tr);
    });
  });

export default suite;
