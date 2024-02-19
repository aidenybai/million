import React, { useRef, useEffect, useState } from 'react';

const VirtualBoard: React.FC = () => {
  // Enum responsible for defining modes
  enum Mode {
    Draw = 'draw',
    Text = 'text',
    Line = 'line',
    Erase = 'erase',
    Clear = 'clear',
  }

  type CoordinateType = Array<{
    points: { x: number; y: number }[];
    color: string;
  }>;

  const [coordinates, setCoordinates] = useState<
    Array<{ points: { x: number; y: number }[]; color: string }>
  >([]);

  // Maintains the current lines state with x, y coordinates
  const [currentLine, setCurrentLine] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [isDrawing, setIsDrawing] = useState(false); // New state to track drawing mode
  const [mode, setMode] = useState<Mode | null>(Mode.Draw);
  const [color, setColor] = useState<string>('#000000');
  // Responsible for controlling position and visibility of the text input field
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    show: boolean;
  }>({ x: 0, y: 0, show: false });
  // Manages the users text input
  const [inputText, setInputText] = useState<string>('');
  const [textElements, setTextElements] = useState<
    Array<{ x: number; y: number; text: string }>
  >([]);

  // Sets state for the start point of a line
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showEraserPreview, setShowEraserPreview] = useState(false);
  const [undoStack, setUndoStack] = useState<CoordinateType[]>([]);
  const [redoStack, setRedoStack] = useState<CoordinateType[]>([]);

  const isChrome = /Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    setUndoStack([...undoStack, coordinates]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const newUndoStack = [...undoStack];
      const lastState = newUndoStack.pop();

      const newRedoStack = [...redoStack, coordinates];

      setCoordinates(lastState || []);
      setUndoStack(newUndoStack);
      setRedoStack(newRedoStack);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();

      const newUndoStack = [...undoStack, coordinates];

      setCoordinates(nextState || []);
      setUndoStack(newUndoStack);
      setRedoStack(newRedoStack);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handleClear = () => {
    setCoordinates([]);
    setTextElements([]);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'line') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!startPoint) {
        setStartPoint({ x, y });
        setIsDrawing(true);
      } else {
        setCoordinates([
          ...coordinates,
          { points: [startPoint, { x, y }], color },
        ]);

        setStartPoint(null); // Reset the starting point immediately
        setIsDrawing(false); // Stop drawing the preview line
      }
    } else {
      setIsDrawing(true);
    }
    setCurrentLine([]);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const newLine = { points: currentLine, color: color };
    const newCoordinates = [...coordinates, newLine];
    if (mode !== 'line') {
      setIsDrawing(false);
      setCoordinates(newCoordinates);
      setCurrentLine([]);
      handleChange();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'line' && startPoint) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentLine([{ x, y }]);
    }
  };

  const mouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'draw') {
      handleDraw(e);
    }
    if (mode === 'erase') {
      handleErase(e);
      handleEraserPreview(e);
    }
    if (mode === 'line') {
      handleMouseMove(e);
    }
  };

  const handleEraserPreview = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const handleText = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'erase') {
      setMode(null);
      return;
    }
    if (mode !== 'text') return; // Only add text when the mode is 'text'

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');

    setTextInput({ x, y, show: true });
  };

  const handleAddTextToCanvas = () => {
    setTextElements([
      ...textElements,
      { x: textInput.x, y: textInput.y, text: inputText },
    ]);
    setTextInput({ ...textInput, show: false });
    setInputText(''); // Clear the input text
  };

  const generatePointsAlongLine = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    numPoints: number,
  ) => {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      points.push({ x, y });
    }
    return points;
  };

  const handleErase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'erase') return;
    setShowEraserPreview(true);

    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCoordinates = coordinates
      .map((lineData) => {
        let closestPoint = null;
        let closestDistance = Infinity;
        let closestIndex = -1;

        lineData.points.forEach((point, index) => {
          const d = distance(x, y, point.x, point.y);
          if (d < closestDistance) {
            closestDistance = d;
            closestPoint = point;
            closestIndex = index;
          }
        });

        if (closestDistance < 20) {
          // Sets eraser size
          const firstHalf = lineData.points.slice(0, closestIndex);
          const secondHalf = lineData.points.slice(closestIndex + 1);
          return [
            { points: firstHalf, color: lineData.color },
            { points: secondHalf, color: lineData.color },
          ];
        }

        return [lineData];
      })
      .flat()
      .filter((lineData) => lineData.points.length > 0); // Remove empty lines

    setCoordinates(newCoordinates);
  };

  useEffect(() => {
    if (textInput.show && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textInput.show]);
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw' || !isDrawing) return; // Only draw when isDrawing is true

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLine([...currentLine, { x, y }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set the color here
    ctx.strokeStyle = color;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the lines from the coordinates state
    coordinates.forEach((lineData) => {
      ctx.strokeStyle = lineData.color;
      ctx.beginPath();
      lineData.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.closePath();
    });

    // Draw text elements
    textElements.forEach((textElement) => {
      ctx.fillStyle = color;
      ctx.font = '20px sans-serif';
      ctx.fillText(textElement.text, textElement.x, textElement.y);
    });

    // Draw the current line
    ctx.strokeStyle = color;
    ctx.beginPath();
    currentLine.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.closePath();

    // Draw the start point for line mode
    if (startPoint && mode === 'line') {
      ctx.fillStyle = 'black';
      ctx.fillRect(startPoint.x - 2, startPoint.y - 2, 4, 4);
    }

    // Draw the preview line for line mode
    if (isDrawing && startPoint && mode === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(
        currentLine[0]?.x || startPoint.x,
        currentLine[0]?.y || startPoint.y,
      );
      ctx.stroke();
      ctx.closePath();
    }
    // Draw eraser preview if mode is 'erase'
    if (mode === 'erase' && mousePosition && showEraserPreview) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // semi-transparent black
      ctx.beginPath();
      ctx.arc(
        mousePosition.x,
        mousePosition.y,
        20 /* radius */,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }, [
    coordinates,
    textElements,
    currentLine,
    mode,
    startPoint,
    isDrawing,
    color,
    mousePosition,
    showEraserPreview,
  ]);
  useEffect(() => {
    const onClickOutsideCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas && !canvas.contains(e.target as Node)) {
        setShowEraserPreview(false);
      }
    };

    document.addEventListener('click', onClickOutsideCanvas);

    return () => {
      document.removeEventListener('click', onClickOutsideCanvas);
    };
  }, []);

  return (
    <>
      <div className="toolBar" style={{ marginBottom: '10px' }}>
        <input
          type="color"
          value={color}
          style={{
            padding: isChrome ? '0' : isFirefox ? '2px' : undefined,
            width: isChrome ? '50px' : isFirefox ? '50px' : undefined,
            height: isChrome ? '33px' : isFirefox ? '30px' : undefined,
          }}
          onChange={handleColorChange}
        />
        <button onClick={() => handleModeChange(Mode.Draw)}> Draw </button>
        <button onClick={() => handleModeChange(Mode.Text)}> Text </button>
        <button onClick={() => handleModeChange(Mode.Line)}> Line </button>
        <button onClick={() => handleModeChange(Mode.Erase)}> Erase </button>
        <button onClick={handleClear}> Clear </button>

        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
      <div className="canvas" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={mouseMoveHandler}
          onClick={handleText}
          width={800}
          height={600}
          style={{
            border: '2px solid black',
            cursor: mode === 'draw' ? 'crosshair' : 'default',
          }}
        />
        <div className="textInputFunctionality">
          {textInput.show && (
            <input
              type="text"
              ref={textInputRef}
              style={{
                position: 'absolute',
                left: `${textInput.x}px`,
                top: `${textInput.y}px`,
                cursor: 'text',
              }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onBlur={handleAddTextToCanvas}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTextToCanvas();
                  e.preventDefault(); // Prevents the default action of a newline
                }
              }}
              autoFocus
            />
          )}
        </div>
      </div>
    </>
  );
};

export default VirtualBoard;
