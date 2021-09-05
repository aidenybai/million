/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */

import { Suite } from 'yet-another-benchmarking-tool';
import { m, createElement, patch, VFlags, UPDATE } from '../../src/index';
import { buildData } from '../data';

const el = document.createElement('table');
const data = buildData(1000);
data.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', undefined, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el.appendChild(row);
});

const row1 = 0;
const row2 = 1;
const temp = data[row1];
data[row1] = data[row2];
data[row2] = temp;

const suite = new Suite('swap rows', [
  [
    'million',
    () => {
      patch(
        el,
        m(
          'table',
          undefined,
          data.map(({ id, label }) => {
            return m('tr', undefined, [
              m('td', undefined, [String(id)]),
              m('td', undefined, [label]),
            ]);
          }),
          VFlags.ANY_CHILDREN,
          [UPDATE(row1), UPDATE(row2)],
        ),
      );
    },
  ],
]);

export default suite;
