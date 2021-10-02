/**
 * @name selectRow
 * @description highlighting a selected row
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, style, UPDATE } from '../../src/index';
import { buildData } from '../data';

const el1 = document.createElement('table');
const data1 = buildData(2 << 15);
data1.forEach(({ id, label }) => {
  const row = createElement(
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});
const row = 0;

const el2 = document.createElement('table');
const data2 = buildData(2 << 15);
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

const suite = new benchmark.Suite('select row');

suite
  .add('million', () => {
    patch(
      el1,
      m(
        'table',
        undefined,
        data1.map(({ id, label }, i) => {
          const newId = String(id);
          return m('tr', { key: newId, style: style({ background: row == i ? 'red' : '' }) }, [
            m('td', undefined, [newId]),
            m('td', undefined, [label]),
          ]);
        }),
        VFlags.ONLY_KEYED_CHILDREN,
        [UPDATE(row)],
      ),
    );
  })
  .add('vanilla', () => {
    el2.childNodes[row].style.background = 'red';
  });

export default suite;
