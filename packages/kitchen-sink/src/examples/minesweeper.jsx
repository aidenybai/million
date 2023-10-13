import { useEffect, useState } from 'react';
import { block } from 'million/react';
const CELL_OPEN = 'open';
const CELL_FLAGGED = 'flagged';

const Toast = block(({message}) => {
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowToast(false);
    }, 3000); // 3000 milliseconds (3 seconds) to automatically close the toast

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={`toast ${showToast ? 'show' : ''}`}>
      <div className="toast-content success">{message}</div>
    </div>
  );
});

export default function App() {
  const [level, setLevel] = useState(4);
  return (
    <div className="App">
      <style>
        {`
        /* Toast.css */
        .toast {
          position: absolute;
          top: 20px;
          right: 20px;
          background-color: #ff5050; /* gray background color for success */
          color: #fff;
          padding: 16px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: opacity 0.5s;
          opacity: 0;
          pointer-events: none;
          z-index: 9999;
        }

        .toast.show {
          opacity: 1;
          pointer-events: auto;
        }
        .minesweeper{
          position:relative;
        }
        .toast-content {
          font-size: 16px;
        }
        h1 {
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
          text-align: center;
        }
        
        .container {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
        }
        
        .App {
          font-family: sans-serif;
          text-align: center;
        }
        
        .row {
          display: flex;
          margin: 0 auto;
        }
        .board {
          display: flex;
          flex-direction: column;
          margin: 0 auto;
        }
        
        .col {
          font-weight: bold;
          height: 30px;
          width: 30px;
          border: 1px solid rgb(167, 166, 166);
          box-sizing: border-box;
          padding: 5px;
          background: rgb(214, 214, 214);
        }
        
        .col.not-open {
          border: 3px outset rgb(231, 231, 231);
        }
        
        .col.color-2 {
          color: green;
        }
        .col.color-1 {
          color: blue;
        }
        .col.color-3 {
          color: red;
        }
        .col.color-4 {
          color: purple;
        }
        .col.color-5 {
          color: brown;
        }
        
        .level-select {
          width: 50px;
        }
        
        .fork-link {
          position: fixed;
          left: 0;
          top: 0;
        }
        
      `}
      </style>
      <label htmlFor="">
        Select Level:{' '}
        <input
          className="level-select"
          onChange={(e) => setLevel(e.target.value)}
          type="number"
          min={1}
          max={7}
          value={level}
        />
      </label>
      <Minesweeper level={level} />
    </div>
  );
}

//Minesweeper.jsx

function Minesweeper({ level }) {
  const [board, setBoard] = useState([]);
  const [cellStates, setCellStates] = useState({});
  const [totalMines, setTotalMines] = useState(0);
  const [boardMax, setBoardMax] = useState(0);
  const [isLost, setIsLost] = useState(false);
  useEffect(() => {
    const minesweeper = new MinesweeperClass(level);
    setBoard(minesweeper.filledBoard);
    setTotalMines(minesweeper.mines.length);
    setBoardMax(5 + level * 2);
    setCellStates([]);
  }, [level]);

  let tempOpenCells = {};

  const openCell = (x, y) => {
    if (tempOpenCells[`${x},${y}`] !== CELL_OPEN) {
      tempOpenCells[`${x},${y}`] = CELL_OPEN;
      if (board[y][x] === '💣') {
        setIsLost(true);
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === '💣') {
              tempOpenCells[`${j},${i}`] = CELL_OPEN;
            }
          }
        }
        setCellStates({ ...cellStates, ...tempOpenCells });
      } else if (board[y][x] === '') {
        if (x > 0) {
          if (y > 0) {
            openCell(x - 1, y - 1);
          }
          if (y < boardMax - 1) {
            openCell(x - 1, y + 1);
          }
          openCell(x - 1, y);
        }
        if (x < boardMax - 1) {
          if (y > 0) {
            openCell(x + 1, y - 1);
          }
          if (y < boardMax - 1) {
            openCell(x + 1, y + 1);
          }
          openCell(x + 1, y);
        }
        if (y > 0) {
          openCell(x, y - 1);
        }
        if (y < boardMax - 1) {
          openCell(x, y + 1);
        }
      }
    }
  };

  const handleCellClick = (x, y) => {
    openCell(x, y);
    setCellStates({ ...cellStates, ...tempOpenCells });
  };

  const handleCellContextMenu = (x, y) => {
    setCellStates({
      ...cellStates,
      [`${x},${y}`]: CELL_FLAGGED,
    });
  };

  return (
    <div className="minesweeper">
      {isLost && <Toast message="Game Over" />}
      <h4>💣 {totalMines}</h4>
      <div className="board">
        {board.map((row, y) => (
          <div className="row" key={`row-${y}`}>
            {row.map((cell, x) => (
              <div
                key={`cell-${x}-${y}`}
                className={`col color-${cell} ${
                  !cellStates[`${x},${y}`] ? 'not-open' : ''
                }`}
                onClick={() => handleCellClick(x, y)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleCellContextMenu(x, y);
                }}
              >
                {cellStates[`${x},${y}`] &&
                  (cellStates[`${x},${y}`] === CELL_OPEN ? cell : '📍')}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ****** //

// minesweeepr.js//

class MinesweeperClass {
  constructor(level) {
    this.boardMax = 5 + level * 2;
    this.board = new Array(this.boardMax)
      .fill('')
      .map((x) => new Array(this.boardMax).fill(''));

    this.mines = [];

    while (this.mines.length < level * level + 5) {
      const newMine = `${this.randomMax(this.boardMax)},${this.randomMax(
        this.boardMax,
      )}`;
      if (!this.mines.includes(newMine)) this.mines.push(newMine);
    }
    this.filledBoard = this.getFilledBoard();
  }

  randomMax(max) {
    return Math.floor(Math.random() * max);
  }

  // @TODO Optimize?
  addMine(mine, filledBoard) {
    filledBoard[mine[0]][mine[1]] = '💣';
    if (mine[0] > 0) {
      if (mine[1] > 0) {
        let nw = filledBoard[mine[0] - 1][mine[1] - 1];
        if (nw !== '💣') {
          filledBoard[mine[0] - 1][mine[1] - 1] = !isNaN(nw) ? ++nw : 1;
        }
      }
      if (mine[1] < this.boardMax - 1) {
        let ne = filledBoard[mine[0] - 1][mine[1] + 1];
        if (ne !== '💣') {
          filledBoard[mine[0] - 1][mine[1] + 1] = !isNaN(ne) ? ++ne : 1;
        }
      }
      let n = filledBoard[mine[0] - 1][mine[1]];
      if (n !== '💣') {
        filledBoard[mine[0] - 1][mine[1]] = !isNaN(n) ? ++n : 1;
      }
    }
    if (mine[0] < this.boardMax - 1) {
      if (mine[1] > 0) {
        let sw = filledBoard[mine[0] + 1][mine[1] - 1];
        if (sw !== '💣') {
          filledBoard[mine[0] + 1][mine[1] - 1] = !isNaN(sw) ? ++sw : 1;
        }
      }
      if (mine[1] < this.boardMax - 1) {
        let se = filledBoard[mine[0] + 1][mine[1] + 1];
        if (se !== '💣') {
          filledBoard[mine[0] + 1][mine[1] + 1] = !isNaN(se) ? ++se : 1;
        }
      }
      let s = filledBoard[mine[0] + 1][mine[1]];
      if (s !== '💣') {
        filledBoard[mine[0] + 1][mine[1]] = !isNaN(s) ? ++s : 1;
      }
    }
    if (mine[1] > 0) {
      let w = filledBoard[mine[0]][mine[1] - 1];
      if (w !== '💣') {
        filledBoard[mine[0]][mine[1] - 1] = !isNaN(w) ? ++w : 1;
      }
    }
    if (mine[1] < this.boardMax - 1) {
      let e = filledBoard[mine[0]][mine[1] + 1];
      if (e !== '💣') {
        filledBoard[mine[0]][mine[1] + 1] = !isNaN(e) ? ++e : 1;
      }
    }
  }

  getFilledBoard() {
    const filledBoard = [...this.board];
    this.mines.forEach((mine) => {
      this.addMine(
        mine.split(',').map((c) => parseInt(c)),
        filledBoard,
      );
    });
    return filledBoard;
  }
}

// ******** //
