import React, { useState } from 'react';
import { block } from 'million/react';

const Game: React.FC = block(() => {
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [computerScore, setComputerScore] = useState<number>(0);
  const [result, setResult] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  const getComputerChoice = (): string => {
    const cOptions: string[] = ['Rock', 'Paper', 'Scissors'];
    return cOptions[Math.floor(Math.random() * 3)];
  };

  const restart = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setResult('');
    setGameOver(false);
  };

  const playRound = (playerSelection: string) => {
    const computerSelection: string = getComputerChoice();

    let newPlayerScore: number = playerScore;
    let newComputerScore: number = computerScore;
    let newResult: string = '';

    if (playerSelection === computerSelection) {
      newResult = "It's a tie!";
    } else if (
      (playerSelection === 'Rock' && computerSelection === 'Scissors') ||
      (playerSelection === 'Paper' && computerSelection === 'Rock') ||
      (playerSelection === 'Scissors' && computerSelection === 'Paper')
    ) {
      newResult = `You win! ${playerSelection} beats ${computerSelection}`;
      newPlayerScore++;
    } else {
      newResult = `You lose! ${computerSelection} beats ${playerSelection}`;
      newComputerScore++;
    }

    if (newPlayerScore === 5) {
      setGameOver(true);
      newResult = 'Player wins the match!';
    } else if (newComputerScore === 5) {
      setGameOver(true);
      newResult = 'Computer wins the match!';
    }

    setPlayerScore(newPlayerScore);
    setComputerScore(newComputerScore);
    setResult(newResult);
  };

  return (
    <div className="game-container">
      <button className="restart" onClick={restart}>
        Restart
      </button>
      <div className="box1">
        <button onClick={() => playRound('Rock')} disabled={gameOver}>
          Rock
        </button>
        <button onClick={() => playRound('Paper')} disabled={gameOver}>
          Paper
        </button>
        <button onClick={() => playRound('Scissors')} disabled={gameOver}>
          Scissors
        </button>
      </div>
      <div className="output">{result}</div>
      <div className="box2">
        <div className="box">
          <div>Player's Score</div>
          <div id="score1">{playerScore}</div>
        </div>
        <div className="box">
          <div>Computer's Score</div>
          <div id="score2">{computerScore}</div>
        </div>
      </div>
      <div className="output1"></div>
      <div id="boxy"></div>
    </div>
  );
});

export default Game;
