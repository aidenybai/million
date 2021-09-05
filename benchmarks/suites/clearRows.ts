/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
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

const suite = new Suite('clear rows', [
  [
    'million',
    () => {
      patch(el, m('table', undefined, [], VFlags.NO_CHILDREN));
    },
  ],
]);

export default suite;
