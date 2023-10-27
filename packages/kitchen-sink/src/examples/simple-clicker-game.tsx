import React, { useState } from 'react';
import { block } from 'million/react';

const SimpleClickerGame: React.FC = block(() => {
  const [score, setScore] = useState<number>(0);

  return (
    <div>
      <h1>Simple Clicker Game</h1>
      <button onClick={() => setScore(score + 1)}>Increase Your Score</button>
      <button onClick={() => setScore(0)} style={{ marginLeft: '10px' }}>
        Reset Score
      </button>
      <p>Score: {score}</p>
    </div>
  );
});

export default SimpleClickerGame;
