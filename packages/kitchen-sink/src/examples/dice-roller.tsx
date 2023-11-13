import React, { useState } from 'react';
import { block } from 'million/react';
import '../css/examples/dice-roller.css';

const DiceRoller: React.FC = block(() => {
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState<boolean>(false);

  const rollDice = () => {
    if (!rolling) {
      setRolling(true);

      const min = 1;
      const max = 6;
      const randomResult = Math.floor(Math.random() * (max - min + 1)) + min;

      setTimeout(() => {
        setResult(randomResult);
        setRolling(false);
      }, 1000); // Adjust the timeout duration if needed
    }
  };

  return (
    <div className={`dice-roller ${rolling ? 'roll-animation' : ''}`}>
      <h1>Virtual Dice Roller</h1>
      <button onClick={rollDice}>Roll Dice</button>
      {result !== null && <p>Result: {result}</p>}
    </div>
  );
});

export default DiceRoller;
