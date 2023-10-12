import React, { useState } from 'react';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { block } from 'million/react';

const initialState = {
  count: 0,
  todos: [] as Todo[],
};

interface Todo {
  id: number;
  text: string;
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      const todo: Todo = {
        id: Math.random() * 100,
        text: action.payload,
      };
      state.todos.push(todo);
      state.count += 1;
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
      state.count -= 1;
    },
  },
});

const store = configureStore({
  reducer: {
    todo: todoSlice.reducer,
  },
});

type TodoItemProps = {
  text: string;
  id: number;
  onCheck: (id: number) => void;
};

const TodoItem = block(({ text, id, onCheck }: TodoItemProps) => {
  const deleteTodo = () => {
    onCheck(id);
  };

  return (
    <div className="todo" onClick={deleteTodo}>
      <input type="checkbox" />
      <label>{text}</label>
    </div>
  );
});

const MainTodoApp = block(() => {
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  );
});

const TodoApp = () => {
  const [input, setInput] = useState('');

  const count = useSelector(
    (state: { todo: typeof initialState }) => state.todo.count,
  );
  const todos = useSelector(
    (state: { todo: typeof initialState }) => state.todo.todos,
  );
  const dispatch = useDispatch();

  const handleAddTodo = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.length >= 1) {
      dispatch(todoSlice.actions.addTodo(input));
      setInput('');
    }
  };

  const handleTodoDone = (id: number) => {
    dispatch(todoSlice.actions.removeTodo(id));
  };

  return (
    <div className="App">
      <form className="App-form" onSubmit={handleAddTodo}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit">+</button>
      </form>
      <div className="Todos">
        {count > 0 &&
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              text={todo.text}
              id={todo.id}
              onCheck={handleTodoDone}
            />
          ))}
        {count === 0 && <p>No todos</p>}
      </div>
    </div>
  );
};

export default MainTodoApp;
