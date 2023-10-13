import React, { useRef, useState } from 'react';

const VirtualBoard: React.FC = () => {
  const [coordinates, setCoordinates] = useState<
    Array<{ x: number; y: number }[]>
  >([]);
  const [currentLine, setCurrentLine] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false); // New state to track drawing mode
  const [mode, setMode] = useState<
    'draw' | 'text' | 'line' | 'erase' | 'clear'
  >('draw');
  const [color, setColor] = useState<string>('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (
    newMode: 'draw' | 'text' | 'line' | 'erase' | 'clear',
  ) => {
    setMode(newMode);
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
    setCurrentLine([])
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
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
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
  };

  return (
    <>
      <div className="toolBar" style={{ marginBottom: '10px' }}>
        <button onClick={() => handleModeChange('draw')}> Draw </button>
        <button onClick={() => handleModeChange('text')}> Text </button>
        <button onClick={() => handleModeChange('line')}> Line </button>
        <button onClick={() => handleModeChange('erase')}> Erase </button>
        <button onClick={() => handleModeChange('clear')}> Clear </button>
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
          width={800}
          height={600}
          style={{ border: '2px solid black' }}
        />
      </div>
    </>
  );
};

export default VirtualBoard;
