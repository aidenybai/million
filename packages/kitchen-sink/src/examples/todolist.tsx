// import { useState } from 'react';
// import { block, For } from 'million/react';

// const TodoList = () => {
//   const [tasks, setTasks] = useState<Object[]>([]);
//   const [taskInput, setTaskInput] = useState<string>('');
//   const [taskIdCounter, setTaskIdCounter] = useState<number>(0);

//   const addTask = () => {
//     if (taskInput.trim() === '') return;
//     setTasks([
//       ...tasks,
//       { id: taskIdCounter, text: taskInput, completed: false },
//     ]);
//     setTaskInput('');
//     setTaskIdCounter(taskIdCounter + 1);
//   };

//   return (
//     <div>
//       <h1>Todo List</h1>
//       <form onSubmit={(event) => event.preventDefault()}>
//         <input
//           type="text"
//           placeholder="Add a task"
//           style={{ width: '40%' }}
//           value={taskInput}
//           onChange={(e) => setTaskInput(e.target.value)}
//         />
//         <button
//           style={{ marginLeft: 10, padding: '10px 20px 10px 20px' }}
//           onClick={addTask}
//         >
//           Add
//         </button>
//       </form>
//       <List tasks={tasks} setTasks={setTasks} />
//     </div>
//   );
// };

// //* <For /> for iterating over the list & block() for optimizing
// const List = block(({ tasks, setTasks }: { tasks: any[]; setTasks: any }) => {
//   const toggleTaskCompletion = (index: number) => {
//     const updatedTasks = [...tasks];
//     updatedTasks[index].completed = !updatedTasks[index].completed;
//     setTasks(updatedTasks);
//   };

//   const removeTask = (index: number) => {
//     const updatedTasks = tasks.filter((task) => task.id !== index);
//     setTasks(updatedTasks);
//     console.log(updatedTasks);
//   };

//   return (
//     <ul>
//       <For each={tasks}>
//         {(task) => (
//           <li
//             key={task.id}
//             style={{
//               margin: '15px 0 15px 0',
//               justifyContent: 'center',
//             }}
//           >
//             <span
//               style={{
//                 fontSize: '1.25em',
//                 textDecoration: task.completed ? 'line-through' : 'none',
//               }}
//             >
//               {task.text}
//             </span>
//             <input
//               type="checkbox"
//               checked={task.completed}
//               style={{ width: '20px', height: '20px', marginLeft: 10 }}
//               onChange={() => toggleTaskCompletion(task.id)}
//             />
//             <button
//               style={{ marginLeft: 10, padding: '7px 15px 7px 15px' }}
//               onClick={() => removeTask(task.id)}
//             >
//               Remove
//             </button>
//           </li>
//         )}
//       </For>
//     </ul>
//   );
// });

// export default TodoList;
import { compiledBlock as _compiledBlock } from "million/react";
import { block as _block } from "million/react";
import { useState } from 'react';
import { block, For } from 'million/react';
const TodoList_1 = _compiledBlock(_props => <div>
      <h1>Todo List</h1>
      <form onSubmit={_props.v0}>
        <input type="text" placeholder="Add a task" style={_props.v1} value={_props.v2} onChange={_props.v3} />
        <button style={_props.v4} onClick={_props.v5}>
          Add
        </button>
      </form>
      {_props.v6}
    </div>, {
  name: "TodoList_1",
  portals: ["v6"]
});
const TodoList = () => {
  const [tasks, setTasks] = useState<Object[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');
  const [taskIdCounter, setTaskIdCounter] = useState<number>(0);
  const addTask = () => {
    if (taskInput.trim() === '') return;
    setTasks([...tasks, {
      id: taskIdCounter,
      text: taskInput,
      completed: false
    }]);
    setTaskInput('');
    setTaskIdCounter(taskIdCounter + 1);
  };
  return /*@million jsx-skip*/<TodoList_1 v0={event => event.preventDefault()} v1={{
    width: '40%'
  }} v2={taskInput} v3={e => setTaskInput(e.target.value)} v4={{
    marginLeft: 10,
    padding: '10px 20px 10px 20px'
  }} v5={addTask} v6={<List tasks={tasks} setTasks={setTasks} />} _hmr="1707640220385" />;
};

//* <For /> for iterating over the list & block() for optimizing
const List_1 = _compiledBlock(_props2 => <ul>
      {_props2.v0}
    </ul>, {
  name: "List_1",
  portals: ["v0"]
});
const List = ({
  tasks,
  setTasks
}: {
  tasks: any[];
  setTasks: any;
}) => {
  const toggleTaskCompletion = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };
  const removeTask = (index: number) => {
    const updatedTasks = tasks.filter(task => task.id !== index);
    setTasks(updatedTasks);
    console.log(updatedTasks);
  };
  return /*@million jsx-skip*/<List_1 v0={<For each={tasks} scoped>
        {task => <li key={task.id} style={{
      margin: '15px 0 15px 0',
      justifyContent: 'center'
    }}>
            <span style={{
        fontSize: '1.25em',
        textDecoration: task.completed ? 'line-through' : 'none'
      }}>
              {task.text}
            </span>
            <input type="checkbox" checked={task.completed} style={{
        width: '20px',
        height: '20px',
        marginLeft: 10
      }} onChange={() => toggleTaskCompletion(task.id)} />
            <button style={{
        marginLeft: 10,
        padding: '7px 15px 7px 15px'
      }} onClick={() => removeTask(task.id)}>
              Remove
            </button>
          </li>}
      </For>} _hmr="1707640220386" />;
};
export default TodoList;
