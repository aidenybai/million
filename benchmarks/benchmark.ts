import Benchmark from 'benchmark';
import { VNode } from 'million';
import * as hundred from 'hundred';
import * as snabbdom from 'snabbdom';
import virtual_dom_VNode from 'virtual-dom/vnode/vnode';
import virtual_dom_VText from 'virtual-dom/vnode/vtext';
import * as simple_virtual_dom from 'simple-virtual-dom';
import _ from 'lodash';

// avoid `Cannot read property 'parentNode' of undefined` error in runScript
const script = document.createElement('script');
document.body.appendChild(script);

// Benchmark could not pick up lodash otherwise
const benchmark = Benchmark.runInContext({ _ });

// @ts-expect-error avoid `ReferenceError: Benchmark is not defined` error because Benchmark is assumed to be in window
window.Benchmark = benchmark;

export const Suite = (name: string, tests: Record<string, Function>) => {
  // @ts-expect-error Suite exists
  const suite = new benchmark.Suite(name);
  Object.entries(tests).forEach(([name, callback]) => {
    suite.add(name, callback);
  });
  return suite;
};

export const millionAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(vnode);
};

export const snabbdomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(
    snabbdom.h(vnode.tag, null, vnode.children?.map(snabbdomAdapter)),
  );
};

export const virtualDomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return new virtual_dom_VText(vnode);
  // @ts-ignore
  return _.clone(
    new virtual_dom_VNode(
      vnode.tag,
      {},
      vnode.children?.map(virtualDomAdapter) || [],
    ),
  );
};

export const simpleVirtualDomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(
    simple_virtual_dom.el(
      vnode.tag,
      {},
      vnode.children?.map(simpleVirtualDomAdapter),
    ),
  );
};

export const hundredAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(hundred.h(vnode.tag, {}, vnode.children.map(hundredAdapter)));
};

export default benchmark;
