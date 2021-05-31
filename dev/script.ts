import { h, patch } from 'million';

const myButtonComponent = (count: number) => {
  patch(
    h('button', { id: 'millapp', onclick: () => myButtonComponent(count + 1) }, [String(count)]),
    document.querySelector('#millapp'),
  );
};

myButtonComponent(0);

let count = 0;

const suite = new Benchmark.Suite();
document.getElementById('app').appendChild(document.createElement('button'));
(document.getElementById('app').firstElementChild as HTMLElement).onclick = () => {
  document.getElementById('app').firstElementChild.textContent = String(++count);
};

// add tests
suite
  .add('million', function () {
    document.getElementById('millapp').click();
  })
  .add('app', function () {
    (document.getElementById('app').firstElementChild as HTMLElement).click();
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ async: true });
