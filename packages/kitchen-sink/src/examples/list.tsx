import { block, For } from 'million/react';

const List = block(() => {
  return (
    <ul>
      <For each={[1, 2, 3, 4, 5]}>
        {(item) => <li key={item}>Item {item}</li>}
      </For>
    </ul>
  );
});

export default List;
