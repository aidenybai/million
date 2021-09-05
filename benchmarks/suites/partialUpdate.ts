/**
 * @name partialUpdate
 * @description updating every 10th row for 1,000 rows
 */

import { Suite } from 'yet-another-benchmarking-tool';
import { m, createElement, patch, UPDATE, VFlags } from '../../src/index';
import { buildData } from '../data';

const el = document.createElement('table');
const data = buildData(1000);
const deltas = [];
data.forEach(({ id, label }) => {
  const row = createElement(
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  );
  el.appendChild(row);
});
for (let i = 0; i < 1000; i += 10) {
  deltas.push(UPDATE(0));
  data[i] = buildData(1)[0];
}

const suite = new Suite('partial update', [
  [
    'million',
    () => {
      patch(
        el,
        m(
          'table',
          undefined,
          data.map(({ id, label }) =>
            m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
          ),
          VFlags.ANY_CHILDREN,
          deltas,
        ),
      );
    },
  ],
]);

export default suite;
