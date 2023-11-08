import React from 'react';
import { block } from 'million/react';

function Square({ onClick, value }) {
  return (
    <button
      className="square"
      style={{
        border: '1px solid #999',
        float: 'left',
        fontSize: '40px',
        height: '80px',
        marginRight: '-1px',
        marginTop: '-1px',
        padding: '0',
        textAlign: 'center',
        width: '80px',
      }}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

const Board = block(() => {
  const [squares, setSquares] = React.useState(Array(9).fill(null));
  const [isX, setIsX] = React.useState(true);

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = isX ? 'X' : 'O';
    setSquares(squares);
    setIsX(!isX);
  };

  const winner = calculateWinner(squares);
  let status;
  if (winner == 'D') {
    status = 'Draw!!';
  } else if (winner) {
    status = `Winner: ${winner}`;
  } else {
    status = 'Next player: ' + (isX ? 'X' : 'O');
  }

  const handleRestart = () => {
    setIsX(true);
    setSquares(Array(9).fill(null));
  };

  const renderSquare = (i) => {
    return <Square value={squares[i]} onClick={() => handleClick(i)} />;
  };

  return (
    <div
      className="board"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div
        className="board-row"
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div
        className="board-row"
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div
        className="board-row"
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <div className="status">{status}</div>
      <button
        className="restart"
        style={{
          width: '30%',
          padding: '10px 15px',
          color: '#fff',
          backgroundColor: '#007bff',
          borderColor: '#007bff',
          borderRadius: '0.25rem',
          transition:
            'color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out',
        }}
        onClick={handleRestart}
      >
        Restart Game!
      </button>
    </div>
  );
});

function calculateWinner(squares) {
  const winningPatterns = [
    [0, 4, 8],
    [3, 4, 5],
    [0, 3, 6],
    [2, 4, 6],
    [1, 4, 7],
    [2, 5, 8],
    [6, 7, 8],
    [0, 1, 2],
  ];

  for (let i = 0; i < winningPatterns.length; i++) {
    const [a, b, c] = winningPatterns[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  let c = 0;
  for (let i = 0; i < 9; i++) {
    if (squares[i]) {
      c++;
    }
  }
  if (c == 9) {
    return 'D';
  }
  return null;
}

export const TicTacToe = () => {
  return (
    <div>
      <Board />
    </div>
  );
};

export default TicTacToe;
