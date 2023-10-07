import React, { useState, useEffect } from 'react';
import { block } from 'million/react';

interface Tile {
  id: number;
}
const Timer = block((timer) => {
  return <div className="timer">Time: {timer.timer} seconds</div>;
});
const Board: React.FC = () => {
  const [tiles, setTiles] = useState<Array<Tile>>(
    [...Array(16).keys()].map((id) => ({ id })),
  );
  const [emptyIndex, setEmptyIndex] = useState<number>(15);
  const [timer, setTimer] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<number | null | any>(null);
  const [isGameStart, setIsGameStart] = useState<boolean>(false);

  useEffect(() => {
    shuffleTiles();
  }, []);

  const startTimer = () => {
    if (!isGameStart) {
      setIsGameStart(true);
    }
    const id = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const shuffleTiles = () => {
    setIsGameStart(false);
    stopTimer();
    setTimer(0);
    if (isGameWon) {
      setIsGameWon(false);
      setTimer(0);
      stopTimer();
    }
    const shuffledTiles = [...tiles];
    for (let i = shuffledTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTiles[i], shuffledTiles[j]] = [
        shuffledTiles[j],
        shuffledTiles[i],
      ];
    }
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.findIndex((tile) => tile.id === 0));
  };

  const handleTileClick = (clickedTile: Tile, clickedIndex: number) => {
    if (!isGameStart) {
      setIsGameStart(true);
      startTimer();
    }

    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;
    const clickedRow = Math.floor(clickedIndex / 4);
    const clickedCol = clickedIndex % 4;

    if (
      (Math.abs(emptyRow - clickedRow) === 1 && emptyCol === clickedCol) ||
      (Math.abs(emptyCol - clickedCol) === 1 && emptyRow === clickedRow)
    ) {
      const newTiles = [...tiles];
      newTiles[emptyIndex] = clickedTile;
      newTiles[clickedIndex] = { id: 0 };
      setTiles(newTiles);
      setEmptyIndex(clickedIndex);
      if (isSolved(newTiles)) {
        setIsGameWon(true);
        stopTimer();
      }
    }
  };

  const isSolved = (currentTiles: Array<Tile>) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i].id !== i + 1) return false;
    }
    return true;
  };

  return (
    <Game
      timer={timer}
      isGameWon={isGameWon}
      tiles={tiles}
      handleTileClick={handleTileClick}
      shuffleTiles={shuffleTiles}
    />
  );
};

const Game: React.FC<{
  timer: number;
  isGameWon: boolean;
  tiles: Tile[];
  handleTileClick: (tile: Tile, index: number) => void;
  shuffleTiles: () => void;
}> = ({ timer, isGameWon, tiles, handleTileClick, shuffleTiles }) => {
  return (
    <div className="puzzle15">
      <Timer timer={timer} />
      <div className={`board ${isGameWon ? 'disabled' : ''}`}>
        {tiles.map((tile: Tile, index: number) => (
          <div
            key={index}
            className={`tile ${tile.id === 0 ? 'empty' : ''}`}
            onClick={() => handleTileClick(tile, index)}
          >
            {tile.id === 0 ? '' : tile.id}
          </div>
        ))}
        {isGameWon && <div className="win-message">You Win!</div>}
        <button onClick={shuffleTiles}>Shuffle</button>
      </div>
    </div>
  );
};
export default Board;
