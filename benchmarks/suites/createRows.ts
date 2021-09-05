/**
 * @name createRows
 * @description creating 1,000 rows
 */

import { Suite } from 'yet-another-benchmarking-tool';
import { m, patch } from '../../src/index';
import { buildData } from '../data';

const suite = new Suite('create rows', [
  [
    'million',
    () => {
      const el = document.createElement('table');
      patch(
        el,
        m(
          'table',
          undefined,
          buildData(1000).map(({ id, label }) =>
            m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
          ),
        ),
      );
    },
  ],
]);

export default suite;
