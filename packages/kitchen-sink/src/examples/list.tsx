import { block, For } from 'million/react';

const List = block(() => {
  const items = { id: 'test' };
  return (
    <ul>
      <For each={[1, 2, 3, 4, 5]}>
        {(item) => (
          <li key={item} {...items}>
            Item {item}
          </li>
        )}
      </For>
    </ul>
  );
});

export default List;
