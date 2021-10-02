/**
 * @name createRows
 * @description creating 1,000 rows
 */

import benchmark from '../benchmark';
import { m, patch } from '../../src/index';
import { buildData } from '../data';

const suite = new benchmark.Suite('create rows');

suite
  .add('million', () => {
    const el = document.createElement('table');
    patch(
      el,
      m(
        'table',
        undefined,
        buildData(2 << 15).map(({ id, label }) =>
          m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
        ),
      ),
    );
  })
  .add('vanilla', () => {
    const el = document.createElement('table');
    buildData(2 << 15).forEach(({ id, label }) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      el.appendChild(tr);
    });
  });

export default suite;
