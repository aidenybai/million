import { block, For } from 'million/react';

const Comp = block(function Comp({ item, children }) {
  return (
    <div>
      {item} {children}
    </div>
  );
});

const List = block(() => {
  return (
    <ul>
      <For each={[1, 2, 3, 4, 5]} id="test">
        {(item) => (
          <Comp item={item}>
            <div>
              Item <p>{item}</p>
            </div>
          </Comp>
        )}
      </For>
    </ul>
  );
});

export default List;
