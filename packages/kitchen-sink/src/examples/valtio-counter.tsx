import { proxy, useSnapshot } from 'valtio';
import { block } from 'million/react';

const state = proxy({ count: 0 });

const Counter = block(() => {
  const snap = useSnapshot(state);
  return <button onClick={() => ++state.count}>{snap.count}</button>;
});

export default Counter;
