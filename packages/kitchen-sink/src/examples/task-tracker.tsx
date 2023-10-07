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

type editItemFuncType = (
  section: string,
  itemIndex: number,
  itemName: string,
) => void;
type addItemFuncType = (section: string, itemName: string) => void;
type deleteItemFuncType = (section: string, indexNumber: number) => void;

type ListDisplayProps = {
  data: ListItem;
  objKey: string;
  addItem: addItemFuncType;
  editItem: editItemFuncType;
  deleteItem: deleteItemFuncType;
};

type ListItemPropType = {
  itemName: string;
  itemIndex: number;
  editItem: editItemFuncType;
  objKey: string;
  deleteItem: deleteItemFuncType;
};

const PlusIcon = ({ size, color }: { size: string; color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      className="bi bi-plus-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
    </svg>
  );
};

const TickIcon = ({ size, color }: { size: string; color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      className="bi bi-check"
      viewBox="0 0 16 16"
    >
      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
    </svg>
  );
};

const CancleIcon = ({ size, color }: { size: string; color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      className="bi bi-x"
      viewBox="0 0 16 16"
    >
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
};

const PenIcon = ({ size, color }: { size: string; color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      className="bi bi-pencil-fill"
      viewBox="0 0 16 16"
    >
      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
    </svg>
  );
};

const TrashIcon = ({ size, color }: { size: string; color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      className="bi bi-trash-fill"
      viewBox="0 0 16 16"
    >
      <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
    </svg>
  );
};

const ListItem = ({
  itemName,
  itemIndex,
  editItem,
  objKey,
  deleteItem,
}: ListItemPropType) => {
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [item, setItem] = useState<string>(itemName);
  function itemOnInputHandler(value: string) {
    setItem(value);
  }
  function addItemHandler() {
    if (!item.trim()) return;
    editItem(objKey, itemIndex, item);
    setIsEditingItem(false);
  }
  function deleteItemHandler() {
    deleteItem(objKey, itemIndex);
  }
  return (
    <>
      <div
        style={{
          display: 'flex',
          background: 'white',
          borderRadius: '0.35rem',
          color: 'black',
          padding: '0.2rem 0.5rem',
          marginTop: '0.8rem',
        }}
      >
        {isEditingItem ? (
          <textarea
            style={{
              flex: 1,
              border: '3px solid #2a9df5',
            }}
            value={item}
            onChange={(e) => itemOnInputHandler(e.target.value)}
          />
        ) : (
          <div
            style={{
              flex: 1,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              overflow: 'hidden',
            }}
          >
            {item}
          </div>
        )}
        {isEditingItem ? (
          <></>
        ) : (
          <>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setIsEditingItem(true)}
            >
              {isEditingItem ? <></> : <PenIcon color="gray" size="16" />}
            </span>
            <span style={{ cursor: 'pointer' }} onClick={deleteItemHandler}>
              <TrashIcon size="16" color="red" />
            </span>
          </>
        )}
      </div>
      {isEditingItem ? (
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <span style={{ cursor: 'pointer' }} onClick={addItemHandler}>
            <TickIcon color="green" size="25" />
          </span>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const ListDisplay = ({
  data,
  objKey,
  addItem,
  editItem,
  deleteItem,
}: ListDisplayProps) => {
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
        margin: '0rem 0.8rem',
        flex: 1,
        overflow: 'hidden',
        borderRadius: '0.4rem',
        padding: '0.5rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        background: 'black',
      }}
    >
      <strong style={{ color: '#35ceff' }}>{data.title}</strong>
      {data.items.map((itemName, index) => {
        return (
          <ListItem
            objKey={objKey}
            key={index}
            itemName={itemName}
            itemIndex={index}
            editItem={editItem}
            deleteItem={deleteItem}
          />
        );
      })}
      {isAddingItem ? (
        <>
          <input
            value={newItemValue}
            onChange={(e) => inputChangeHandler(e.target.value)}
            style={{
              border: '3px solid #2a9df5',
              background: 'white',
              borderRadius: '0.35rem',
              color: 'black',
              padding: '0.5rem 0.5rem',
              marginTop: '0.8rem',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <span style={{ cursor: 'pointer' }} onClick={cancleAddItemHandler}>
              <CancleIcon color="red" size="25" />
            </span>
            <span style={{ cursor: 'pointer' }} onClick={addItemHandler}>
              <TickIcon color="green" size="25" />
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
          <PlusIcon color="white" size="25" />
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
  function editItem(section: string, itemIndex: number, newItemName: string) {
    setListData((data) => {
      const obj = { ...data };
      const selectedSection = obj[section as keyof ListData];
      selectedSection.items = selectedSection.items.map((itemName, index) => {
        if (index === itemIndex) return newItemName;
        return itemName;
      });

      return obj;
    });
  }
  function deleteItem(section: string, itemIndex: number) {
    setListData((data) => {
      const obj = { ...data };
      const selectedSection = obj[section as keyof ListData];
      selectedSection.items = selectedSection.items.filter(
        (itemName, index) => {
          return index !== itemIndex;
        },
        );
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
            editItem={editItem}
            deleteItem={deleteItem}
          />
        );
      })}
    </div>
  );
}

export default TaskTracker;
