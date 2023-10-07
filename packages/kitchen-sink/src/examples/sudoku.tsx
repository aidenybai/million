import { useState, useRef, useEffect } from 'react'
// import { generateSudokuBoard } from './utils/generateBoard'
// import { checkSolved } from './utils/checkSolved'
// import { nullifyValues } from './utils/nullifyValues'
// import './globals.css'
// import { fillBoard } from "./fillBoard"
// import { isValid } from "./isValid"
// import { shuffle } from "./shuffle"

declare type Board = number[][];


/**************************************************
 *              isValid Component
 *************************************************/
export function isValid(board: Board, row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) {
        return false;
      }
    }
  
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) {
        return false;
      }
    }
  
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === num) {
          return false;
        }
      }
    }
  
    return true;
  }  


/**************************************************
 *              Shuffle Component
 *************************************************/
export function shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


/**************************************************
 *          Generate Sudoku Board Component
 *************************************************/
export function fillBoard(board: Board, row: number, col: number): boolean {
  if (row === 9) {
    return true;
  }

  let nextRow = row;
  let nextCol = col + 1;
  if (nextCol === 9) {
    nextRow += 1;
    nextCol = 0;
  }

  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const num of numbers) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (fillBoard(board, nextRow, nextCol)) {
        return true;
      }
    }
  }

  board[row][col] = 0;
  return false;
}



/**************************************************
 *          Generate Sudoku Board Component
 *************************************************/
export function generateSudokuBoard(): Board {
  const board: Board = [];

  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      board[i][j] = 0;
    }
  }

  fillBoard(board, 0, 0);

  return board;
}


/**************************************************
 *             CheckSovled Component
 *************************************************/
export function checkSolved(board: Board, originalBoard: Board): boolean {
    if (board.length !== 9 || originalBoard.length !== 9) {
      return false;
    }
  
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== originalBoard[i][j]) {
          return false;
        }
      }
    }
    return true;
  }  


/**************************************************
 *              NullifyValues Component
 *************************************************/
export const nullifyValues = (board: Board) => {
    const cellsToNullify = 40;
    let cellsNullified = 0;
    while (cellsNullified < cellsToNullify) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        cellsNullified++;
      }
    }
  };
  

/**************************************************
 *                Title Component
 *************************************************/
 const Title = () => {
    return (
      <h1 className="title">
        Sudoku <span>by</span> <a href="https://github.com/datsfilipe">datsfilipe</a>
      </h1>
    )
  }
  

/**************************************************
 *                Main Component
 *************************************************/
function App() {
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const boardOriginal = useRef<Board>(generateSudokuBoard());
  const [board, setBoard] = useState<Board>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newBoard = JSON.parse(JSON.stringify(boardOriginal.current)) as Board;
    nullifyValues(newBoard);
    setInitialBoard(newBoard);
    setBoard(newBoard);
  }, [boardOriginal]);

  if (checkSolved(board, boardOriginal.current)) {
    alert('You solved the puzzle!');
  }

  return (
    <main>
        <style>
            {`
                :root {
                    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
                      "Helvetica Neue", sans-serif;
                    color-scheme: light dark;
                    color: rgba(255, 255, 255, 0.87);
                    background-color: #181818;
                    font-synthesis: none;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    -webkit-text-size-adjust: 100%;
                  }
                  
                 
                  
                  main {
                    min-width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                  }
                  
                 
                  
                  @media (prefers-color-scheme: light) {
                    :root {
                      color: #213547;
                      background-color: #ffffff;
                    }
                    a:hover {
                      color: #ffffff;
                    }
                    button {
                      background-color: #f9f9f9;
                    }
                  }
                  
                  .content {
                    width: 100%;
                    height: 100vh;
                    margin: 0 auto;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    line-height: 0;
                    justify-content: center;
                  }
                  
                  .sidebar {
                    position: absolute;
                    width: 15rem;
                    height: 100%;
                    background-color: #212121;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    margin: 0;
                    transition: transform 0.3s ease-in-out;
                  }
                  
                  .sidebar .instructions {
                    padding: 2rem;
                  }
                  
                  .sidebar .instructions .actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    width: 100%;
                  }
                  
                  button {
                    border: none;
                    background-color: transparent;
                    color: #1a1a1a;
                    font-size: 1rem;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    background-color: #fff;
                    transition: background-color 0.3s ease-in-out;
                  }
                  
                  button:hover {
                    background-color: #ccc;
                  }
                  
                  .sidebar-button {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    margin: 2rem;
                  }
                  
                  .title {
                    font-size: 2.5rem;
                    text-align: center;
                    flex-wrap: wrap;
                    width: 80%;
                    height: 5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                  }
                  
                  .board {
                    background-color: #1a1a1a;
                    color: #fff;
                    width: 30rem;
                    height: 30rem;
                    display: grid;
                    grid-template-columns: repeat(9, 1fr);
                  
                    @media (max-width: 768px) {
                      width: 20rem;
                      height: 20rem;
                    }
                  
                    @media (max-width: 480px) {
                      width: 15rem;
                      height: 15rem;
                    }
                  }
                  
                  .square {
                    display: grid;
                    grid-template-rows: repeat(9, 1fr);
                  }
                  
                  .row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                  }
                  
                  .cell {
                    border: 1px solid #aaa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.45rem;
                    cursor: pointer;
                    padding: 0;
                  }
                  
                  .filled {
                    background-color: #333;
                  }
                  
                  .empty {
                    background-color: #1a1a1a;
                  }
                  
                  .input {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background-color: transparent;
                    color: #fff;
                    text-align: center;
                    padding: 0;
                    font-size: 1.45rem;
                  
                    @media (max-width: 768px) {
                      font-size: 1.25rem;
                    }
                  
                    @media (max-width: 480px) {
                      font-size: 0.95rem;
                    }
                  }
                  
                  .slider {
                    width: 100%;
                    height: 20%;
                    border: none;
                    background-color: transparent;
                    color: #fff;
                    font-size: 1.45rem;
                    text-align: center;
                    padding: 0;
                  }
                  
            `}
        </style>
      <aside
        className="sidebar"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="instructions">
          <h2>Instructions</h2>
          <p>
            Fill in the grid so that every row, every column, and every 3x3 box contains the digits 1 through 9.
          </p>

          <h2>How to Play</h2>
          <p>
            Click on a cell and enter a number using your keyboard.
          </p>
          <h2>Actions</h2>
          <div className="actions">
            <button
              className='button'
              onClick={() => {
                const newBoard = JSON.parse(JSON.stringify(boardOriginal.current)) as Board;
                nullifyValues(newBoard);
                setInitialBoard(newBoard);
                setBoard(newBoard);
              }}
            >
              Reset
            </button>
            <button
              className='button'
              onClick={() => {
                const newBoard = JSON.parse(JSON.stringify(boardOriginal.current)) as Board;
                setBoard(newBoard);
              }}
            >
              Solve
            </button>
          </div>
        </div>
      </aside>
      <button
        className="sidebar-button"
        onClick={() => setOpen(!open)}
      >
        {open ? '⬅' : '➡'}
      </button>
      <div className="content">
        <Title />
        <div className="board">
          {board.map((square, i) => (
            <div className="square" key={i}>
              {square.map((num, j) => (
                <div key={j} className={`cell ${initialBoard?.[i][j] ? 'filled' : ''}`}>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    disabled={initialBoard?.[i][j] ? true : false}
                    className="input"
                    value={num === 0 ? '' : num}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 1 || value > 9) {
                        return;
                      }

                      const newBoard = JSON.parse(JSON.stringify(board));
                      newBoard[i][j] = value;
                      setBoard(newBoard);
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App


