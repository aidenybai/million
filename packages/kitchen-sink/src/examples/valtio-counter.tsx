import { proxy, useSnapshot } from 'valtio';
import { block } from 'million/react';

const state = proxy({ count: 0 });

const Counter = block(() => {
  const snap = useSnapshot(state);
  return <button onClick={() => ++state.count}>{snap.count}</button>;
});

// eslint-disable-next-line import/no-default-export
export default Counter;
