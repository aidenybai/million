import { useState } from 'react';

type ListItem = {
  title: string;
  items: string[];
};

type ListData = {
  TODO: ListItem;
  IN_PROGRESS: ListItem;
  COMPLETED: ListItem;
};

type ListDisplayProps = {
  data: ListItem;
  objKey: string;
  addItem: (section: string, itemName: string) => void;
};

const PlusIcon = ({ size }: { size: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className="bi bi-plus-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
    </svg>
  );
};

const TickIcon = ({ size }: { size: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className="bi bi-check"
      viewBox="0 0 16 16"
    >
      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
    </svg>
  );
};

const CancleIcon = ({ size }: { size: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className="bi bi-x"
      viewBox="0 0 16 16"
    >
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
};

const ListDisplay = ({ data, objKey, addItem }: ListDisplayProps) => {
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItemValue, setNewItemValue] = useState<string>('');
  function inputChangeHandler(value: string) {
    setNewItemValue(value);
  }
  function addItemHandler() {
    if (!newItemValue.trim()) return;
    addItem(objKey, newItemValue);
    setNewItemValue('');
    setIsAddingItem(false);
  }
  function cancleAddItemHandler() {
    setNewItemValue('');
    setIsAddingItem(false);
  }
  return (
    <div
      style={{
        margin: '5px 20px',
        width: '25%',
        border: '1px solid white',
        borderRadius: '4px',
        padding: '5px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <strong>{data.title}</strong>{' '}
      {data.items.map((itemName, index) => {
        return (
          <div
            key={index}
            style={{
              border: '1px solid black',
              background: 'beige',
              borderRadius: '4px',
              color: 'black',
              padding: '5px',
              marginTop: '10px',
            }}
          >
            {itemName}
          </div>
        );
      })}
      {isAddingItem ? (
        <>
          <input
            value={newItemValue}
            onChange={(e) => inputChangeHandler(e.target.value)}
            style={{
              border: '1px solid black',
              background: 'beige',
              borderRadius: '4px',
              color: 'black',
              padding: '5px',
              marginTop: '10px',
              height: '20px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <span style={{ cursor: 'pointer' }} onClick={cancleAddItemHandler}>
              <CancleIcon size="20" />
            </span>
            <span style={{ cursor: 'pointer' }} onClick={addItemHandler}>
              <TickIcon size="20" />
            </span>
          </div>
        </>
      ) : (
        <></>
      )}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => setIsAddingItem(true)}
        >
          <PlusIcon size="25" />
        </span>
      </div>
    </div>
  );
};

function TaskTracker() {
  const [listData, setListData] = useState<ListData>({
    TODO: {
      title: 'To-Do',
      items: [],
    },
    IN_PROGRESS: {
      title: 'In Progress',
      items: [],
    },
    COMPLETED: {
      title: 'Completed',
      items: [],
    },
  });

  function addItem(section: string, itemName: string) {
    setListData((data) => {
      const obj = { ...data };
      obj[section as keyof ListData].items = [
        ...obj[section as keyof ListData].items,
        itemName,
      ];
      return obj;
    });
  }
  return (
    <div style={{ display: 'flex' }}>
      {Object.keys(listData).map((objKey, index) => {
        return (
          <ListDisplay
            addItem={addItem}
            key={index}
            data={listData[objKey as keyof ListData]}
            objKey={objKey}
          />
        );
      })}
    </div>
  );
}

export default TaskTracker;
