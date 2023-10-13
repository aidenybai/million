import React, { useRef, useState } from 'react';

const VirtualBoard: React.FC = () => {
  const [coordinates, setCoordinates] = useState<
    Array<{ x: number; y: number }[]>
  >([]);
  const [currentLine, setCurrentLine] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [isDrawing, setIsDrawing] = useState(false); // New state to track drawing mode
  const [mode, setMode] = useState<
    'draw' | 'text' | 'line' | 'erase' | 'clear'
  >('draw');
  const [color, setColor] = useState<string>('#000000');
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    show: boolean;
  }>({ x: 0, y: 0, show: false });

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (
    newMode: 'draw' | 'text' | 'line' | 'erase' | 'clear',
  ) => {
    setMode(newMode);
  };

  const handleClear = () => {
    setCoordinates([]);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  //   const handleColorButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  //     colorInputRef.current?.click();
  //   };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setCoordinates([...coordinates, currentLine]);
    setCurrentLine([]);
  };

  const handleText = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'text') return; // Only add text when the mode is 'text'

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    
    setTextInput({x, y, show: true});
  };

  

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return; // Only draw when isDrawing is true

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLine([...currentLine, { x, y }]);
  };

  const drawOnCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the lines from the coordinates state
    coordinates.forEach((line) => {
      ctx.beginPath();
      line.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });

    // Draw the current line
    ctx.beginPath();
    currentLine.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  return (
    <>
      <div className="toolBar" style={{ marginBottom: '10px' }}>
        <button onClick={() => handleModeChange('draw')}> Draw </button>
        <button onClick={() => handleModeChange('text')}> Text </button>
        <button onClick={() => handleModeChange('line')}> Line </button>
        <button onClick={() => handleModeChange('erase')}> Erase </button>
        <button onClick={handleClear}> Clear </button>
        <input type="color" value={color} onChange={handleColorChange} />
        {/* <button onClick={handleColorButtonClick}>
          Color
          <div
            className="btn-container"
            style={{
              background: color,
              width: '24px',
              height: '24px',
              display: 'inline-block',
              marginLeft: '5px',
            }}
          />
        </button> */}
      </div>
      <div className="canvas">
        <canvas
          ref={drawOnCanvas}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleDraw}
          onClick={handleText}
          width={800}
          height={600}
          style={{ border: '2px solid black' }}
        />
        {textInput.show && (
    <input
      type="text"
      style={{
        position: 'absolute',
        left: `${textInput.x}px`,
        top: `${textInput.y}px`,
        cursor: 'text',
      }}
      autoFocus
    />
  )}
  
      </div>
    </>
  );
};

export default VirtualBoard;
