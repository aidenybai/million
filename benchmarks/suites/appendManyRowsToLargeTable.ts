/**
 * @name appendManyRowsToLargeTable
 * @description appending 1,000 to a table of 10,000 rows.
 */

import { Suite } from 'yet-another-benchmarking-tool';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const el = document.createElement('table');
const data = buildData(10000);
data.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el.appendChild(row);
});
data.push(...buildData(1000));

const suite = new Suite('append many rows to large table', [
  [
    'million',
    () => {
      patch(
        el,
        m(
          'table',
          undefined,
          buildData(1000).map(({ id, label }) =>
            m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
          ),
          VFlags.ONLY_KEYED_CHILDREN,
        ),
      );
    },
  ],
]);

export default suite;
