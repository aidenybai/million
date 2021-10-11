import Benchmark from 'benchmark';
import _ from 'lodash';

// avoid `Cannot read property 'parentNode' of undefined` error in runScript
const script = document.createElement('script');
document.body.appendChild(script);

// Benchmark could not pick up lodash otherwise
const benchmark = Benchmark.runInContext({ _ });

// avoid `ReferenceError: Benchmark is not defined` error because Benchmark is assumed to be in window
window.Benchmark = benchmark;

export const Suite = (name, tests) => {
  const suite = new benchmark.Suite(name);
  Object.entries(tests).forEach(([name, callback]) => {
    suite.add(name, callback);
  });
  return suite;
};

export const reformatVNode = (vnode) => {
  if (typeof vnode === 'string') return;
  if (vnode.key) delete vnode.key;
  if (vnode.props === undefined || vnode.props === null) vnode.props = {};
  if (vnode.children === undefined || vnode.children === null) vnode.children = [];
  if (vnode.children.length > 0) {
    vnode.children.forEach(reformatVNode);
  }
};

// Virtual DOM libraries like snabbdom, virtual-dom will
// mutate the vnode, even though the vnode must be
// immutable for the benchmark. For this case, we deep
// copy the vnode. This ensures compatibility throughout
// the suite tests.
export const vnodeAdapter = (vnode) => {
  const clonedVNode = _.cloneDeep(vnode);
  reformatVNode(clonedVNode);
  return clonedVNode;
};

export default benchmark;
