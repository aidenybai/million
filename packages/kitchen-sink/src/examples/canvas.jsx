import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { block } from 'million/react';

const useStyles = makeStyles({
  canvascover: {
    opacity: '1',
  },
});

const Canvas = block(() => {
  const classes = useStyles();
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B3B3B');
  const [size, setSize] = useState('3');
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const timeout = useRef(null);
  const [cursor, setCursor] = useState('default');

  useEffect(() => {
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext('2d');

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const canvasimg = localStorage.getItem('canvasimg');
    if (canvasimg) {
      const image = new Image();
      ctx.current = canvas.getContext('2d');
      image.onload = function () {
        ctx.current.drawImage(image, 0, 0);
        setIsDrawing(false);
      };
      image.src = canvasimg;
    } else {
      const context = canvas.getContext('2d');
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [ctx]);

  const startPosition = ({ nativeEvent }) => {
    setIsDrawing(true);
    draw(nativeEvent);
  };

  const finishedPosition = () => {
    setIsDrawing(false);
    ctx.current.beginPath();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext('2d');
    ctx.current.lineWidth = size;
    ctx.current.lineCap = 'round';
    ctx.current.strokeStyle = color;

    ctx.current.lineTo(nativeEvent.clientX, nativeEvent.clientY);
    ctx.current.stroke();
    ctx.current.beginPath();
    ctx.current.moveTo(nativeEvent.clientX, nativeEvent.clientY);

    if (timeout.current !== undefined) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      const base64ImageData = canvas.toDataURL('image/png');
      localStorage.setItem('canvasimg', base64ImageData);
    }, 400);
  };

  const clearCanvas = () => {
    localStorage.removeItem('canvasimg');
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (timeout.current !== undefined) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      var base64ImageData = canvas.toDataURL('image/png');
      localStorage.setItem('canvasimg', base64ImageData);
    }, 400);
  };

  const getPen = () => {
    setCursor('default');
    setSize('3');
    setColor('#3B3B3B');
  };

  const eraseCanvas = () => {
    setCursor('grab');
    setSize('20');
    setColor('#FFFFFF');
    const circularCursor = document.getElementById('circularcursor');

    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('mousemove', (e) => {
        if (circularCursor) {
          circularCursor.style.left = e.pageX + 'px';
          circularCursor.style.top = e.pageY + 'px';
        }
      });
    });

    if (!isDrawing) {
      return;
    }
  };

  return (
    <div>
      <div
        className="canvas-btn"
        style={{
          position: 'absolute',
          marginLeft: '10px',
          marginTop: '10px',
          borderRadius: '5px',
          borderStyle: 'solid',
          padding: '5px 5px',
          borderColor: 'gray',
          borderWidth: 'thin',
        }}
      >
        <button
          onClick={getPen}
          className="btn-width"
          style={{ minWidth: '50px' }}
        >
          Pencil
        </button>
        <div className="btn-width" style={{ minWidth: '50px' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          <select
            className="btn-width"
            style={{ minWidth: '50px' }}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option> 1 </option>
            <option> 3 </option>
            <option> 5 </option>
            <option> 10 </option>
            <option> 15 </option>
            <option> 20 </option>
            <option> 25 </option>
            <option> 30 </option>
          </select>
        </div>
        <button
          onClick={clearCanvas}
          className="btn-width"
          style={{ minWidth: '50px' }}
        >
          Clear
        </button>
        <div>
          <button
            onClick={eraseCanvas}
            className="btn-width"
            style={{ minWidth: '50px' }}
          >
            Erase
          </button>
        </div>
      </div>
      <canvas
        style={{ cursor: cursor, height: '100%', width: '100%' }}
        onMouseDown={startPosition}
        onMouseUp={finishedPosition}
        onMouseMove={draw}
        ref={canvasRef}
        className={classes.canvascover}
      />
    </div>
  );
});

export default Canvas;
