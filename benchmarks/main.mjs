import 'style.css';

import { m, createElement, style, kebab, patch } from '../src/index';

import appendManyRowsToLargeTable from './suites/appendManyRowsToLargeTable';
import clearRows from './suites/clearRows';
import createManyRows from './suites/createManyRows';
import createRows from './suites/createRows';
import partialUpdate from './suites/partialUpdate';
import removeRow from './suites/removeRow';
import replaceAllRows from './suites/replaceAllRows';
import selectRow from './suites/selectRow';
import swapRows from './suites/swapRows';

const logs = [];
let disabled = false;

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
      log(event.target);
    })
    .on('complete', () => {
      log(`Fastest is ${suite.filter('fastest').map('name')}`);
      disabled = false;
      patch(el, vnode());
    }),
);

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
            disabled = true;
            logs.unshift([]);
            log(`Running: ${suite.name}`);
            suite.run({ async: true });
            patch(el, vnode());
          },
          style: style({ margin: '5px' }),
          disabled,
        },
        [suite.name],
      ),
    ),
    m(
      'div',
      { style: style(kebab({ paddingTop: '20px' })) },
      logs.map(
        (logGroup) =>
          logGroup.length && m('pre', undefined, [m('code', undefined, [logGroup.join('\n')])]),
      ),
    ),
  ]);

const el = createElement(vnode());

const log = (message) => {
  logs[0].push(message);
  patch(el, vnode());
  console.log(String(message));
};

document.body.appendChild(el);
