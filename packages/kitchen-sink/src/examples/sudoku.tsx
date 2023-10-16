import { useState, useRef, useEffect } from 'react';
import { block } from 'million/react';

declare type Board = number[][];

/**************************************************
 *              isValid Component
 *************************************************/
 function isValid(
  board: Board,
  row: number,
  col: number,
  num: number,
): boolean {
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
 function shuffle(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**************************************************
 *          Generate Sudoku Board Component
 *************************************************/
 function fillBoard(board: Board, row: number, col: number): boolean {
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
 function checkSolved(board: Board, originalBoard: Board): boolean {
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
 const nullifyValues =  (board: Board) => {
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
  return <h1 className="class_title">Sudoku</h1>;
};

/**************************************************
 *                Toast Component
 *************************************************/
const Toast = block(({ message }: { message: string }) => {
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

/**************************************************
 *                Main Component
 *************************************************/
const App =() => {
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const boardOriginal = useRef<Board>(generateSudokuBoard());
  const [board, setBoard] = useState<Board>([]);

  useEffect(() => {
    const newBoard = JSON.parse(JSON.stringify(boardOriginal.current)) as Board;
    nullifyValues(newBoard);
    setInitialBoard(newBoard);
    setBoard(newBoard);
  }, [boardOriginal]);

 
  return (
    <main
      style={{
        background:'linear-gradient(to bottom right, rgb(40, 40, 43),rgb(48, 25, 52))',
        position : 'relative'
      }}
    >
      <style>
        {`
                
                  
                
                  .class_content {
                    width: 100%;
                    height: 100vh;
                    margin-left: 10%;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    line-height: 0;
                    justify-content: center;
                  }
                  
                  .class_sidebar {
                    position: absolute;
                    width: 15rem;
                    height: 100%;
                    background-color: rgb(48, 25, 52);
                    color: rgb(237, 234, 222);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    margin: 0;
                    transition: transform 0.3s ease-in-out;
                  }
                  
                  .class_sidebar .instructions {
                    padding: 2rem;
                  }
                  
                  .class_sidebar .instructions .actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    width: 100%;
                  }
                  
                  .class_button {
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
                  
                  .class_button:hover {
                    background-color: #ccc;
                  }
                  
                  .class_sidebar-button {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    margin: 2rem;
                  }
                  
                  .class_title {
                    font-size: 2.5rem;
                    text-align: center;
                    flex-wrap: wrap;
                    width: 80%;
                    color:#E35335;
                    height: 5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                  }
                  
                  .class_board {
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
                  .border_right{
                    border-right:3px solid gray;
                  }
                  .border_left{
                    border-left:3px solid gray;
                  }
                  .border_bottom{
                    border-bottom:1px solid gray;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.45rem;
                    cursor: pointer;
                    padding: 0;
                  }
                  .border_top{
                    border-top:3px solid gray;
                  }
                  .square {
                    display: grid;
                    grid-template-rows: repeat(9, 1fr);
                  }
                  
                  .row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                  }
                  .cell_bottom{
                    border-width: 1px 1px 3px 1px;
                    border-color: gray gray white gray;
                    border-style: solid;
                  }
                  .cell_right{
                    border-width: 1px 3px 1px 1px;
                    border-color: gray white gray gray;
                    border-style: solid;
                  }
                  .cell_left{
                    border-width: 1px 1px 3px 1px;
                    border-color: white;
                    border-style: solid;
                  }
                  .cell_top{
                    border-width: 1px 1px 3px 1px;
                    border-color: white;
                    border-style: solid;
                  }
                  .cell_both{
                    border-width: 1px 3px 3px 1px;
                    border-color: gray white white gray;
                    border-style: solid;
                  }
                  .border{
                    border:1px solid gray;
                  }
                  .cell {
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
                  /* Toast.css */
                  .toast {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background-color: #4caf50; /* gray background color for success */
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

                  .toast-content {
                    font-size: 16px;
                  }
                  
            `}
      </style>
      {checkSolved(board, boardOriginal.current) && (<Toast message='Hooray! 🎉 Puzzle solved!'/>)}
      <aside className="class_sidebar" style={{ transform: 'translateX(0)' }}>
        <div className="instructions">
          <h2>Instructions</h2>
          <p>
            Fill in the grid so that every row, every column, and every 3x3 box
            contains the digits 1 through 9.
          </p>

          <h2>How to Play</h2>
          <p>Click on a cell and enter a number using your keyboard.</p>
          <h2>Actions</h2>
          <div className="actions">
            <button
              className="class_button"
              onClick={() => {
                const newBoard = JSON.parse(
                  JSON.stringify(boardOriginal.current),
                ) as Board;
                nullifyValues(newBoard);
                setInitialBoard(newBoard);
                setBoard(newBoard);
              }}
            >
              Reset
            </button>
            <button
              className="class_button"
              onClick={() => {
                const newBoard = JSON.parse(
                  JSON.stringify(boardOriginal.current),
                ) as Board;
                setBoard(newBoard);
              }}
            >
              Solve
            </button>
          </div>
        </div>
      </aside>
      {/*<button
        className="sidebar-button"
        onClick={() => setOpen(!open)}
      >
        {open ? '⬅' : '➡'}
            </button>*/}
      <div className="class_content">
        <Title />
        <div className="class_board">
          {board.map((square, i) => (
            <div className={`square`} key={i}>
              {square.map((num, j) => {
                console.log(j);
                return(
                <div
                  key={j}
                  className={`cell ${initialBoard?.[i][j] ? 'filled' : ''} ${(j%3==2 && (i%3!=j%3))?(j!=8)?"cell_bottom":("border"):""} ${(i%3==2 && (i%3!=j%3))?(i!=8)?"cell_right":("border"):""} ${(i%3==j%3 && i%3==2)? (j==8 && i!=8) ? "cell_right":(i==8 && j!=8)?("cell_bottom"):(i==8 && j==8)?("border"):("cell_both"):""} ${(i%3!=2 && j%3!=2)?"border":""}`}
                >
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
              )})}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
