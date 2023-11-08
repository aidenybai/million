import React, { useState, FormEvent } from 'react';
import { block } from 'million/react';

interface NumberGuessingGameProps {}

const NumberGuessingGame: React.FC<NumberGuessingGameProps> = block(() => {
  const [systemNumber] = useState(() => Math.floor(Math.random() * 10000) + 1);
  const [userNumber, setUserNumber] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [message, setMessage] = useState<string>(
    'Guess the number between 1 and 10000!',
  );

  const handleGuess = (e: FormEvent) => {
    e.preventDefault();
    if (userNumber === systemNumber) {
      setMessage(`Congratulations, you win in ${attempts} moves!`);
    } else {
      setAttempts(attempts + 1);
      setMessage(
        userNumber > systemNumber
          ? 'Please decrease your value'
          : 'Please increase your value',
      );
    }
  };

  return (
    <div>
      <h1>Number Guessing Game</h1>
      <p>{message}</p>
      <p>Moves taken: {attempts}</p>
      <form onSubmit={handleGuess}>
        <input
          type="number"
          value={userNumber}
          onChange={(e) => setUserNumber(parseInt(e.target.value))}
        />
        <button type="submit">Guess</button>
      </form>
      <h3>
        Fun Fact : This game will take max 14 moves to win . Find out how :)
      </h3>
    </div>
  );
});

export default NumberGuessingGame;
