import { Benchmark } from 'yet-another-benchmarking-tool';
import { m, createElement } from '../src/index';

import appendManyRowsToLargeTable from './suites/appendManyRowsToLargeTable';
import clearRows from './suites/clearRows';
import createManyRows from './suites/createManyRows';
import createRows from './suites/createRows';
import partialUpdate from './suites/partialUpdate';
import removeRow from './suites/removeRow';
import replaceAllRows from './suites/replaceAllRows';
import selectRow from './suites/selectRow';
import swapRows from './suites/swapRows';

const suites = [
  appendManyRowsToLargeTable,
  clearRows,
  createManyRows,
  createRows,
  partialUpdate,
  removeRow,
  replaceAllRows,
  selectRow,
  swapRows,
];

const el = createElement(
  m('div', undefined, [
    'Check console for results - Compliant with ',
    m('a', { href: 'https://github.com/krausest/js-framework-benchmark', target: '_blank' }, [
      'JS Framework Benchmark',
    ]),
    m('br'),
    m('br'),
    ...suites.map((suite) =>
      m('button', { onclick: () => new Benchmark([suite]).run() }, [suite.name]),
    ),
    m('button', { onclick: () => new Benchmark(suites).run() }, ['All']),
  ]),
);

document.body.appendChild(el);
