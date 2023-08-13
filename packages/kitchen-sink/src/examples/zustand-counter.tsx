import { create } from 'zustand';
import { block } from 'million/react';

const useStore = create<{
  count: number;
  inc: () => void;
}>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

const Counter = block(() => {
  const { count, inc } = useStore();
  return <button onClick={inc}>{count}</button>;
});

export default Counter;
