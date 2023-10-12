import { useState } from 'react';
import { block, For } from 'million/react';

const TodoList = block(() => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');

  const addTask = () => {
    if (taskInput.trim() === '') return;
    setTasks([
      ...tasks,
      { id: tasks.length, text: taskInput, completed: false },
    ]);
    setTaskInput('');
  };

  const toggleTaskCompletion = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          placeholder="Add a task"
          style={{ width: '40%' }}
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button
          style={{ marginLeft: 10, padding: '10px 20px 10px 20px' }}
          onClick={() => addTask()}
        >
          Add
        </button>
      </div>
      <ul>
        <For each={tasks}>
          {(task) => (
            <li key={task.id} style={{ margin: '15px 0 15px 0' }}>
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
    </div>
  );
});

export default TodoList;
