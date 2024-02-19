import { useState } from 'react';
import { block, For } from 'million/react';

const TodoList = () => {
  const [tasks, setTasks] = useState<Object[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');
  const [taskIdCounter, setTaskIdCounter] = useState<number>(0);

  const addTask = () => {
    if (taskInput.trim() === '') return;
    setTasks([
      ...tasks,
      { id: taskIdCounter, text: taskInput, completed: false },
    ]);
    setTaskInput('');
    setTaskIdCounter(taskIdCounter + 1);
  };

  return (
    <div>
      <h1>Todo List</h1>
      <form onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          placeholder="Add a task"
          style={{ width: '40%' }}
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button
          style={{ marginLeft: 10, padding: '10px 20px 10px 20px' }}
          onClick={addTask}
        >
          Add
        </button>
      </form>
      <List tasks={tasks} setTasks={setTasks} />
    </div>
  );
};

//* <For /> for iterating over the list & block() for optimizing
const List = block(({ tasks, setTasks }: { tasks: any[]; setTasks: any }) => {
  const toggleTaskCompletion = (index: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === index ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const removeTask = (index: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== index);
    setTasks(updatedTasks);
  };

  return (
    <ul>
      <For each={tasks}>
        {(task) => (
          <li
            key={task.id}
            style={{
              margin: '15px 0 15px 0',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '1.25em',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.text}
            </span>
            <input
              type="checkbox"
              checked={task.completed}
              style={{ width: '20px', height: '20px', marginLeft: 10 }}
              onChange={() => toggleTaskCompletion(task.id)}
            />
            <button
              style={{ marginLeft: 10, padding: '7px 15px 7px 15px' }}
              onClick={() => removeTask(task.id)}
            >
              Remove
            </button>
          </li>
        )}
      </For>
    </ul>
  );
});

export default TodoList;
