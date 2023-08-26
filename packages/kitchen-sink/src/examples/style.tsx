import { block } from 'million/react';
import { useState } from 'react';

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const getRandomFontWeight = () => {
  return Math.floor(Math.random() * 900) + 100;
};

const getRandomFontSize = () => {
  return Math.floor(Math.random() * 50) + 10;
};

const Style = block(() => {
  const [color, setColor] = useState(() => getRandomColor());
  const [fontWeight, setFontWeight] = useState(() => getRandomFontWeight());
  const [fontSize, setFontSize] = useState(() => getRandomFontSize());

  return (
    <div>
      <button onClick={() => setColor(getRandomColor())}>Random Color</button>
      <button onClick={() => setFontWeight(getRandomFontWeight())}>
        Random Font Weight
      </button>
      <button onClick={() => setFontSize(getRandomFontSize())}>
        Random Font Size
      </button>
      <button
        onClick={() => {
          setColor(getRandomColor());
          setFontWeight(getRandomFontWeight());
          setFontSize(getRandomFontSize());
        }}
      >
        Randomize Everything
      </button>
      <div style={{ color, fontWeight, fontSize }}>Hello World</div>
    </div>
  );
});

export default Style;
