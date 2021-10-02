import 'style.css';

import { m, createElement, style, patch } from '../src/index';

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
      log(String(event.target));
    })
    .on('complete', () => {
      log(`Fastest is ${suite.filter('fastest').map('name')}`);
    }),
);

const logs = [];

const vnode = () =>
  m('div', undefined, [
    m('h3', undefined, 'Million Benchmarks'),
    'This benchmark is compliant with ',
    m('a', { href: 'https://github.com/krausest/js-framework-benchmark', target: '_blank' }, [
      'JS Framework Benchmark.',
    ]),
    m('br'),
    m('br'),
    'Please note that Benchmark results are unstable. To have more stable results:',
    m('ol', undefined, [
      m('li', undefined, ['Restart OS. Do not run any applications. Put power cable to laptop.']),
      m('li', undefined, ['Run tests 5 times.']),
      m('li', undefined, ['Take the best result for each candidate.']),
    ]),
    ...suites.map((suite) =>
      m(
        'button',
        {
          onclick: () => {
            log(`\nRunning: ${suite.name}`);
            suite.run({ async: true });
          },
          style: style({ margin: '5px' }),
        },
        [suite.name],
      ),
    ),
    m(
      'button',
      {
        onclick: () => {
          suites.forEach((suite) => suite.run({ async: true }));
        },
        style: style({ margin: '5px' }),
      },
      ['all'],
    ),
    m('br'),
    logs.length && m('pre', undefined, [m('code', undefined, [logs.join('\n')])]),
  ]);

const el = createElement(vnode());

const log = (message) => {
  logs.push(message);
  patch(el, vnode());
  console.log(String(message));
};

document.body.appendChild(el);
