import { it, describe } from 'vitest';
import { babel } from '../packages/compiler';
import { pluginTester } from 'babel-plugin-tester';

(globalThis as any).it = it;
(globalThis as any).describe = describe;

pluginTester({
  plugin: babel,
  filepath: __filename,
  babelOptions: {
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    generatorOpts: {},
    babelrc: false,
    configFile: false,
  },
  pluginOptions: {
    mode: 'react',
  },
  tests: {
    callable: {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <div>Hi</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(() => {
          return <div>Hi</div>;
        }, null);
        let Component3 = () => {
          return <Block_Component />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    'simple callable block with props': {
      code: `
        import { block } from 'million/react';
        const Component = block(({ count }) => {
          return <div>{count}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ count }) => {
            return <div>{count}</div>;
          },
          {
            shouldUpdate: (a, b) => a?.count !== b?.count,
          }
        );
        let Component3 = ({ count }) => {
          return <Block_Component count={count} />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    'inline callable ': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => <div>Hi</div>);
      `,
      output: `
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(() => {
          return <div>Hi</div>;
        }, null);
        let Component3 = () => {
          return <Block_Component />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    'non-callable': {
      code: `
        import { block } from 'million/react';
        import { useState } from 'react';
        const Component = block(() => {
          const [count] = useState(0);
          return <div>{count}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        import { useState } from 'react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ count }) => {
            return <div>{count}</div>;
          },
          {
            shouldUpdate: (a, b) => a?.count !== b?.count,
          }
        );
        let Component3 = () => {
          const [count] = useState(0);
          return <Block_Component count={count} />;
        };
        const Component = Component3;
      `,
    },
    'non-callable with props': {
      code: `
        import { block } from 'million/react';
        import { useState } from 'react';
        const Component = block(({ count }) => {
          return <div>{count}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        import { useState } from 'react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ count }) => {
            return <div>{count}</div>;
          },
          {
            shouldUpdate: (a, b) => a?.count !== b?.count,
          }
        );
        let Component3 = ({ count }) => {
          return <Block_Component count={count} />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    'non-callable with props and state': {
      code: `
        import { block } from 'million/react';
        import { useState } from 'react';
        const Component = block(({ count }) => {
          const [state] = useState(0);
          return <div>{count}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        import { useState } from 'react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ count }) => {
            return <div>{count}</div>;
          },
          {
            shouldUpdate: (a, b) => a?.count !== b?.count,
          }
        );
        let Component3 = ({ count }) => {
          const [state] = useState(0);
          return <Block_Component count={count} />;
        };
        const Component = Component3;
      `,
    },
    'hoisted data': {
      code: `
        import { block } from 'million/react';
        import { useState } from 'react';
        const Component = block(() => {
          const [count, setCount] = useState(0);
          return <div onClick={() => setState(count + 1)}>{count + 1}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        import { useState } from 'react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _, _2 }) => {
            return <div onClick={_}>{_2}</div>;
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._ || a?._2 !== b?._2,
          }
        );
        let Component3 = () => {
          const [count, setCount] = useState(0);
          let _ = () => setState(count + 1),
            _2 = count + 1;
          return <Block_Component _={_} _2={_2} />;
        };
        const Component = Component3;
      `,
    },
    'hoisted data with props': {
      code: `
        import { block } from 'million/react';
        import { useState } from 'react';
        const Component = block(({ count }) => {
          return <div onClick={() => setState(count + 1)}>{count + 1}</div>;
        });
      `,
      output: `
        import { block } from 'million/react';
        import { useState } from 'react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _, _2 }) => {
            return <div onClick={_}>{_2}</div>;
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._ || a?._2 !== b?._2,
          }
        );
        let Component3 = ({ count }) => {
          let _ = () => setState(count + 1),
            _2 = count + 1;
          return <Block_Component _={_} _2={_2} />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    svg: {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" />
          </svg>;
        });
      `,
      output: `
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          () => {
            return (
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" />
              </svg>
            );
          },
          {
            svg: true,
          }
        );
        let Component3 = () => {
          return <Block_Component />;
        };
        Component3._c = true;
        const Component = Component3;
      `,
    },
    'component portal': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <div><Foreign /></div>;
        });
      `,
      output: `
        import { useState as _useState } from 'react';
        import { renderReactScope as _renderReactScope } from 'million/react';
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _ }) => {
            return <div>{_}</div>;
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._,
          }
        );
        let Component3 = () => {
          let portal = _useState(() => ({
              $: new Array(1),
            }))[0],
            _ = _renderReactScope(<Foreign />, false, portal.$, 0, false);
          let P = new Array(1);
          for (let i = 0, l = portal.$.length; i < l; ++i) P[i] = portal.$[i]?.portal;
          return (
            <>
              <Block_Component _={_} />
              {P}
            </>
          );
        };
        const Component = Component3;
      `,
    },
    'multiple component portal': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <div><Foreign1 /><Foreign2 /></div>;
        });
      `,
      output: `
        import { useState as _useState } from 'react';
        import { renderReactScope as _renderReactScope2 } from 'million/react';
        import { renderReactScope as _renderReactScope } from 'million/react';
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _, _2 }) => {
            return (
              <div>
                {_}
                {_2}
              </div>
            );
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._ || a?._2 !== b?._2,
          }
        );
        let Component3 = () => {
          let portal = _useState(() => ({
              $: new Array(2),
            }))[0],
            _ = _renderReactScope(<Foreign1 />, false, portal.$, 0, false),
            _2 = _renderReactScope2(<Foreign2 />, false, portal.$, 1, false);
          let P = new Array(2);
          for (let i = 0, l = portal.$.length; i < l; ++i) P[i] = portal.$[i]?.portal;
          return (
            <>
              <Block_Component _={_} _2={_2} />
              {P}
            </>
          );
        };
        const Component = Component3;
      `,
    },
    'component portal as root': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <Foreign />;
        });
      `,
      output: `
        import { block } from 'million/react';
        let Component2 = () => {
          return <Foreign />;
        };
        const Component = Component2;
      `,
    },
    'member expression portal': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          const test = 'https://example.com/test.png';
          return <div><Foo.Bar><img src={test} /></Foo.Bar></div>;
        });
      `,
      output: `
        import { useState as _useState } from 'react';
        import { renderReactScope as _renderReactScope } from 'million/react';
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _ }) => {
            return <div>{_}</div>;
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._,
          }
        );
        let Component3 = () => {
          const test = 'https://example.com/test.png';
          let portal = _useState(() => ({
              $: new Array(1),
            }))[0],
            _ = _renderReactScope(
              <Foo.Bar>
                <img src={test} />
              </Foo.Bar>,
              false,
              portal.$,
              0,
              false
            );
          let P = new Array(1);
          for (let i = 0, l = portal.$.length; i < l; ++i) P[i] = portal.$[i]?.portal;
          return (
            <>
              <Block_Component _={_} />
              {P}
            </>
          );
        };
        const Component = Component3;
      `,
    },
    'map expression': {
      code: `
        import { block } from 'million/react';
        const Component = block(() => {
          return <div>{[1, 2, 3].map((i) => <div>{i}</div>)}</div>;
        });
      `,
      output: `
        import { useState as _useState } from 'react';
        import { renderReactScope as _renderReactScope } from 'million/react';
        import { For as _For } from 'million/react';
        import { block } from 'million/react';
        let Block_Component = /*@__SKIP__*/ block(
          ({ _ }) => {
            return <div>{_}</div>;
          },
          {
            shouldUpdate: (a, b) => a?._ !== b?._,
          }
        );
        let Component3 = () => {
          let portal = _useState(() => ({
              $: new Array(1),
            }))[0],
            _ = _renderReactScope(
              <_For each={[1, 2, 3]}>
                {(i) =>
                  ForBody({
                    i: i,
                  })
                }
              </_For>,
              false,
              portal.$,
              0,
              false
            );
          let P = new Array(1);
          for (let i = 0, l = portal.$.length; i < l; ++i) P[i] = portal.$[i]?.portal;
          return (
            <>
              <Block_Component _={_} />
              {P}
            </>
          );
        };
        const Component = Component3;
        let Block_ForCallback = /*@__SKIP__*/ block(
          ({ i }) => {
            return <div>{i}</div>;
          },
          {
            shouldUpdate: (a, b) => a?.i !== b?.i,
          }
        );
        const ForCallback2 = ({ i }) => {
          return <Block_ForCallback i={i} />;
        };
        ForCallback2._c = true;
        const ForBody = ForCallback2;
      `,
    },
  },
});
