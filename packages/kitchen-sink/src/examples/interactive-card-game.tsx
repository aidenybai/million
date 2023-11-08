import React, { useState, useEffect } from 'react';
import { block } from 'million/react';
interface Card {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}
const generateDeck = (): Card[] => {
  const cards: Card[] = [];
  for (let i = 1; i <= 8; i++) {
    cards.push({
      id: i,
      isFlipped: false,
      isMatched: false,
      onClick: () => null,
    });
    cards.push({
      id: i,
      isFlipped: false,
      isMatched: false,
      onClick: () => null,
    });
  }
  return cards.sort(() => Math.random() - 0.5);
};

const Card = block(({ id, isFlipped, isMatched, onClick }) => {
  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''} ${
        isMatched ? 'matched' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-content">{isFlipped || isMatched ? id : '?'}</div>
    </div>
  );
});

const CardGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>(generateDeck());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning]);

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  useEffect(() => {
    if (selectedCards.length === 2) {
      setMoves((prevMoves) => prevMoves + 1);
      setTimeout(() => {
        checkForMatch();
      }, 1000);
    }
  }, [selectedCards]);

  const calculateScore = () => {
    // Bonus for consecutive matches
    const consecutiveMatchesBonus = multiplier >= 1 ? 100 * multiplier : 0;

    // Total score calculation
    const calculatedScore = score + consecutiveMatchesBonus;
    setScore(calculatedScore); // Update the total score
  };

  const handleCardClick = (cardIndex: number) => {
    if (selectedCards.length < 2 && !cards[cardIndex].isFlipped) {
      const newCards = [...cards];
      newCards[cardIndex].isFlipped = true;
      setSelectedCards([...selectedCards, cardIndex]);
      setCards(newCards); // Update score on every card click
    }
  };

  const checkForMatch = () => {
    const [card1, card2] = selectedCards;
    const newCards = [...cards];
    if (cards[card1].id === cards[card2].id) {
      newCards[card1].isMatched = true;
      newCards[card2].isMatched = true;
      // Double the multiplier on a successful match
      setMultiplier((prevMultiplier) => prevMultiplier * 2);
      calculateScore();
      checkWin(newCards);
    } else {
      newCards[card1].isFlipped = false;
      newCards[card2].isFlipped = false;
      // Reset the multiplier on a failed match
      setMultiplier(1);
      const penalty = 10;
      setScore((prevScore) => Math.max(0, prevScore - penalty));
    }
    setCards(newCards);
    setSelectedCards([]);
  };

  const checkWin = (currentCards: Card[]) => {
    const isGameWon = currentCards.every((card) => card.isMatched);
    if (isGameWon) {
      setIsWon(true);
      stopTimer();
      calculateScore();
    }
  };

  const resetGame = () => {
    setCards(generateDeck());
    setSelectedCards([]);
    setIsWon(false);
    setMultiplier(1);
    setScore(0);
    setMoves(0);
    setTimer(0);
  };

  return (
    <div className="card-game-container">
      <h1>{isWon ? 'You Win!' : 'Memory Card Game'}</h1>
      <div>
        <div>Moves: {moves}</div>
        <div>Time: {timer} seconds</div>
        <div>Score: {score}</div> {/* Display the score */}
        {multiplier > 1 && <div>Multiplier: {multiplier}x</div>}
      </div>
      <div className="card-grid">
        {cards.map((card, index) => (
          <Card
            key={index}
            id={card.id}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => {
              handleCardClick(index);
              if (!isTimerRunning) startTimer();
            }}
          />
        ))}
      </div>
      {isWon && (
        <div>
          <button className="play-again-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <CardGame />
    </div>
  );
};

export default App;
