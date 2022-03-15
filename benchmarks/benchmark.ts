import Benchmark from 'benchmark';
import { VNode } from 'million';
import { h } from 'snabbdom';
import VirtualDom_VNode from 'virtual-dom/vnode/vnode';
import VirtualDom_VText from 'virtual-dom/vnode/vtext';
import { el } from 'simple-virtual-dom';
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

export const snabbdomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(h(vnode.tag, null, vnode.children.map(snabbdomAdapter)));
};

export const virtualDomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return new VirtualDom_VText(vnode);
  // @ts-ignore
  return _.clone(new VirtualDom_VNode(vnode.tag, {}, vnode.children.map(virtualDomAdapter)));
};

export const simpleVirtualDomAdapter = (vnode: VNode): any => {
  if (typeof vnode === 'string') return vnode;
  // @ts-ignore
  return _.clone(el(vnode.tag, {}, vnode.children.map(simpleVirtualDomAdapter)));
};

export default benchmark;
