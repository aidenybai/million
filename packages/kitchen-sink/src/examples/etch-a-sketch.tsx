import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { block } from 'million/react';

interface GridElement {
  id: number;
  color: string;
}
const EtchASketch: React.FC = block(() => {
  const [n, setN] = useState<number>(16);
  const [gridElements, setGridElements] = useState<GridElement[]>([]);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    grid();
  }, [n]);

  const colors: string[] = [
    'red',
    'blue',
    'green',
    'pink',
    'yellow',
    'royalblue',
    'purple',
  ];

  const grid = () => {
    const newGridElements: GridElement[] = [];

    for (let i = 1; i <= n * n; i++) {
      newGridElements.push({
        id: i,
        color: 'black',
      });
    }

    setGridElements(newGridElements);
  };

  const newGrid = () => {
    const dimension: string | null = prompt('Enter the dimension');
    if (dimension === '' || dimension === null) return;

    clearGrid();
    setN(Number(dimension));
    grid();
  };

  const clearGrid = () => {
    setGridElements([]);
    grid();
  };

  const handleCellMouseOver = (id: number) => {
    setGridElements((prevElements) => {
      const updatedElements: GridElement[] = [...prevElements];
      updatedElements[id - 1].color =
        currentColor !== null
          ? currentColor
          : colors[Math.floor(Math.random() * 7)];
      return updatedElements;
    });
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
  };

  return (
    <div>
      <div className="button-container">
        <button className="sketch-button" onClick={newGrid}>
          New Grid
        </button>
        <button className="sketch-button" onClick={clearGrid}>
          Reset
        </button>
        <button className="sketch-button" onClick={() => setCurrentColor(null)}>
          Random Color
        </button>
        <div className="color-container">
          <label>Choose Color</label>
          <input
            type="color"
            value={currentColor || ''}
            onChange={handleColorChange}
          />
          {currentColor !== null ? (
            <div
              style={{
                backgroundColor: `${currentColor}`,
                border: '2px solid black',
                height: '30px',
                width: '30px',
                borderRadius: '5px',
              }}
            ></div>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="container" ref={containerRef}>
        {gridElements.map((element) => (
          <div
            key={element.id}
            style={{
              width: `calc(50vw/${n})`,
              height: `calc(50vw/${n})`,
              backgroundColor: element.color,
            }}
            onMouseOver={() => handleCellMouseOver(element.id)}
          ></div>
        ))}
      </div>
    </div>
  );
});

export default EtchASketch;
