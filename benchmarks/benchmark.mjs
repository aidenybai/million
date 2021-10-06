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

export default benchmark;
