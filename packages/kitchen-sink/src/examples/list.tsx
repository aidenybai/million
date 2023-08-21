import { block, For } from 'million/react';

const List = block(() => {
  return (
    <ul>
      <For each={[1, 2, 3, 4, 5]}>{(num: number) => <li>{num}</li>}</For>
    </ul>
  );
});

export default List;
