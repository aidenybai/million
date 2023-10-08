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
};

const ListDisplay = ({ data }: ListDisplayProps) => {
  return <div>{data.title}</div>;
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
  return (
    <div>
      {Object.keys(listData).map((key, index) => {
        return (
          <ListDisplay key={index} data={listData[key as keyof ListData]} />
        );
      })}
    </div>
  );
}

export default TaskTracker;
