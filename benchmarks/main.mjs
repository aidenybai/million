import 'style.css';

import { m, createElement, style } from '../src/index';

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
].map((suite) =>
  suite
    .on('cycle', (event) => {
      console.log(String(event.target));
    })
    .on('complete', () => {
      console.log(`Fastest is ${suite.filter('fastest').map('name')}`);
    }),
);

const el = createElement(
  m('div', undefined, [
    m('h1', undefined, 'Benchmarks'),
    'Open console to check for results. This benchmark is compliant with ',
    m('a', { href: 'https://github.com/krausest/js-framework-benchmark', target: '_blank' }, [
      'JS Framework Benchmark',
    ]),
    m('br'),
    m('br'),
    ...suites.map((suite) =>
      m('div', { style: style({ padding: '5px' }) }, [
        m(
          'button',
          {
            onclick: () => {
              console.log(`\nRunning: ${suite.name}`);
              suite.run({ async: true });
            },
          },
          [suite.name],
        ),
      ]),
    ),
    m('div', { style: style({ padding: '5px' }) }, [
      m(
        'button',
        {
          onclick: () => {
            suites.forEach((suite) => suite.run({ async: true }));
          },
        },
        ['All'],
      ),
    ]),
  ]),
);

document.body.appendChild(el);
