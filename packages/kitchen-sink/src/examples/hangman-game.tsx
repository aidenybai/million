import { useEffect, useState } from 'react';
import { block } from 'million/react';
import styled from 'styled-components';

const words = [
  { 'A large, flightless bird': 'ostrich' },
  { 'A nocturnal flying mammal': 'bat' },
  { 'A cold-blooded reptile often kept as a pet': 'snake' },
  { 'A four-legged, domesticated animal that barks': 'dog' },
  { 'A small, colorful insect that flies and collects nectar': 'butterfly' },
  { 'A large, long-necked animal native to Africa': 'giraffe' },
  { 'A popular citrus fruit': 'orange' },
  { 'A large, ferocious feline': 'tiger' },
  { 'A frozen dessert often served in a cone': 'ice cream' },
  { 'A yellow, crescent-shaped fruit': 'banana' },
  { 'A small, burrowing rodent': 'mole' },
  {
    'A mythical creature with the body of a lion and the head of an eagle':
      'griffin',
  },
  {
    'A cold and creamy dairy product often used as a topping': 'whipped cream',
  },
  { 'A small, green vegetable often used in salads': 'cucumber' },
  { 'A fast-running bird with long legs': 'ostrich' },
  { "A round, red fruit often associated with Valentine's Day": 'strawberry' },
  { 'A domesticated animal known for producing milk': 'cow' },
  { 'A venomous arachnid with eight legs': 'spider' },
  { 'A large, slow-moving mammal known for its long trunk': 'elephant' },
  { 'A popular seafood delicacy often served with butter': 'lobster' },
  { 'A fast, graceful mammal known for its long neck': 'gazelle' },
  { 'A hot, caffeinated beverage often served in the morning': 'coffee' },
  { 'A tropical fruit with a tough, spiky outer shell': 'pineapple' },
  { 'A sweet, sticky substance made by bees': 'honey' },
  { 'A large, striped big cat known for its roar': 'lion' },
  { 'A green vegetable used in salads and sandwiches': 'lettuce' },
  { 'A small, furry animal that hops': 'rabbit' },
  { 'A delicious, circular baked good often topped with icing': 'doughnut' },
  { 'A sour, yellow fruit often used in pies': 'lemon' },
  { 'A fast-swimming marine mammal with sharp teeth': 'dolphin' },
  { 'A small, red fruit often used in jams and jellies': 'strawberry' },
  { 'A cold, frozen dessert often served in a cup or cone': 'ice cream' },
  { 'A large, powerful bird of prey': 'eagle' },
  { 'A popular Italian pasta dish with tomato sauce': 'spaghetti' },
  { 'A long, thin pasta often used in Asian cuisine': 'noodle' },
  { 'A tiny, red fruit often used in salsa': 'tomato' },
  { 'A large, leafy green vegetable often used in salads': 'spinach' },
  { 'A small, furry rodent often kept as a pet': 'hamster' },
  { 'A sweet, sticky substance used to sweeten food and drinks': 'sugar' },
  { 'A popular breakfast food made from ground grains': 'cereal' },
  { 'A small, green vegetable often used in stir-fry': 'pea' },
  { 'A tropical fruit with a tough outer shell and sweet flesh': 'coconut' },
  { 'A round, orange fruit often associated with Halloween': 'pumpkin' },
  { 'A cold, fizzy beverage often served in cans or bottles': 'soda' },
  { 'A warm, comforting beverage often made from tea leaves': 'chai' },
  { 'A small, round fruit often used in pies and cobblers': 'cherry' },
  { 'A sweet, brown substance often used as a topping for pancakes': 'syrup' },
  { 'A delicious, creamy dairy product often used in desserts': 'cream' },
];

const tryAgainIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.75 8a4.5 4.5 0 0 1-8.61 1.834l-1.391.565A6.001 6.001 0 0 0 14.25 8A6 6 0 0 0 3.5 4.334V2.5H2v4l.75.75h3.5v-1.5H4.352A4.5 4.5 0 0 1 12.75 8z"
      clipRule="evenodd"
    />
  </svg>
);

/****************************************************************
              ***************************************
                       Drawing Component
              ***************************************
*****************************************************************/

interface Drawing {
  numberOfGuesses: number;
}

const Drawing = block(({ numberOfGuesses }: Drawing) => {
  const Head = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 100%;
    border: 10px solid black;
    position: absolute;
    top: 40px;
    right: -29px;

    @media (min-width: 768px) {
      top: 50px;
    }
  `;

  const Body = styled.div`
    width: 10px;
    height: 80px;
    background: black;
    position: absolute;
    top: 90px;
    right: 0;

    @media (min-width: 768px) {
      height: 100px;
      top: 119px;
    }
  `;

  const RightArm = styled.div`
    width: 70px;
    height: 10px;
    background: black;
    position: absolute;
    top: 110px;
    right: -70px;
    rotate: -30deg;
    transform-origin: left bottom;

    @media (min-width: 768px) {
      width: 100px;
      top: 130px;
      right: -100px;
    }
  `;

  const LeftArm = styled.div`
    width: 70px;
    height: 10px;
    background: black;
    position: absolute;
    top: 110px;
    right: 10px;
    rotate: 30deg;
    transform-origin: right bottom;

    @media (min-width: 768px) {
      width: 100px;
      top: 130px;
    }
  `;

  const RightLeg = styled.div`
    width: 80px;
    height: 10px;
    background: black;
    position: absolute;
    top: 160px;
    right: -70px;
    rotate: 60deg;
    transform-origin: left bottom;

    @media (min-width: 768px) {
      width: 100px;
      top: 209px;
      right: -90px;
    }
  `;

  const LeftLeg = styled.div`
    width: 80px;
    height: 10px;
    background: black;
    position: absolute;
    top: 160px;
    right: 0;
    rotate: -60deg;
    transform-origin: right bottom;

    @media (min-width: 768px) {
      width: 100px;
      top: 209px;
    }
  `;

  const Element1 = styled.div`
    height: 10px;
    width: 120px;
    background: black;

    @media (min-width: 768px) {
      height: 10px;
      width: 200px;
    }
  `;

  const Element2 = styled.div`
    margin-left: 60px;
    height: 300px;
    width: 10px;
    background: black;

    @media (min-width: 768px) {
      margin-left: 100px;
      height: 320px;
      width: 10px;
    }
  `;

  const Element3 = styled.div`
    margin-left: 60px;
    height: 10px;
    width: 150px;
    background: black;

    @media (min-width: 768px) {
      margin-left: 100px;
      height: 10px;
      width: 200px;
    }
  `;

  const Element4 = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    height: 40px;
    width: 10px;
    background: black;

    @media (min-width: 768px) {
      height: 50px;
    }
  `;

  const BodyParts = [Head, Body, RightArm, LeftArm, RightLeg, LeftLeg];
  const Gallows = [Element4, Element3, Element2, Element1];

  return (
    <div style={{ position: 'relative' }}>
      {BodyParts.slice(0, numberOfGuesses).map((Component, id) => (
        <Component key={id} />
      ))}
      {Gallows.map((Component, id) => (
        <Component key={id} />
      ))}
    </div>
  );
});

/****************************************************************
              ***************************************
                       Keyboard Component
              ***************************************
*****************************************************************/

interface Keyboard {
  correctLetters: string[];
  incorrectLetters: string[];
  addGuessedLetter: (letter: string) => void;
  disabled?: boolean;
}

const Keyboard = block(
  ({
    correctLetters,
    incorrectLetters,
    addGuessedLetter,
    disabled = false,
  }: Keyboard) => {
    const KeyContainer = styled.div`
      align-self: stretch;
    `;

    const KeyboardGrid = styled.div`
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      gap: 0.5rem;
      width: 100%;
    `;

    interface Key {
      active: boolean;
      inActive: boolean;
    }

    const Key = styled.button<Key>`
      aspect-ratio: 1/1;
      width: 100%;
      border: 3px solid black;
      border-radius: 1rem;
      font-size: 2rem;
      font-family: unset;
      font-family: monospace;
      text-transform: uppercase;
      font-weight: bold;
      background: ${({ active }) => (active ? '#16A085' : 'none')};
      color: ${({ active }) => (active ? 'white' : 'black')};
      opacity: ${({ inActive }) => (inActive ? '.3' : '1')};
      cursor: pointer;

      &:hover:not(:disabled),
      &:focus:not(:disabled) {
        background-color: #f4d03f;
      }

      &:disabled {
        cursor: not-allowed;
      }

      @media (min-width: 768px) {
        font-size: 2.3rem;
      }
    `;
    const KEYS = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];

    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (
          !disabled &&
          KEYS.includes(key) &&
          !correctLetters.includes(key) &&
          !incorrectLetters.includes(key)
        ) {
          addGuessedLetter(key);
        }
      };

      window.addEventListener('keydown', handleKeyPress);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };

      // eslint-disable-next-line
    }, [correctLetters, incorrectLetters, addGuessedLetter, disabled]);

    return (
      <KeyContainer>
        <KeyboardGrid>
          {KEYS.map((key) => {
            const active = correctLetters.includes(key);
            const inActive = incorrectLetters.includes(key);

            return (
              <Key
                key={key}
                active={active}
                inActive={inActive}
                disabled={active || inActive || disabled}
                onClick={() => addGuessedLetter(key)}
              >
                {key}
              </Key>
            );
          })}
        </KeyboardGrid>
      </KeyContainer>
    );
  },
);

/****************************************************************
              ***************************************
                       Word Component
              ***************************************
*****************************************************************/

interface WordProps {
  guessedLetters: string[];
  wordToGuess: string;
  reveal?: boolean;
}

const Word = block(
  ({ guessedLetters, wordToGuess, reveal = false }: WordProps) => {
    const WordContainer = styled.div`
      padding: 0.5rem;
      display: flex;
      gap: 1rem;
      max-width: 100vw;
      font-size: 3rem;
      font-weight: bold;
      text-transform: uppercase;
      font-family: monospace;
      overflow-x: auto !important;

      @media (min-width: 768px) {
        font-size: 5rem;
      }
    `;

    const Border = styled.span`
      border-bottom: 0.5rem solid black;
    `;

    interface Letter {
      guessedLetters: string[];
      letter: string;
      reveal?: boolean;
    }

    const Letter = styled.span<Letter>`
      visibility: ${({ guessedLetters, letter, reveal }) =>
        guessedLetters.includes(letter) || reveal ? 'visible' : 'hidden'};
      color: ${({ guessedLetters, letter, reveal }) =>
        !guessedLetters.includes(letter) && reveal ? '#d30000' : 'black'};
    `;
    return (
      <WordContainer>
        {wordToGuess.split('').map((letter, id) => (
          <Border key={id}>
            <Letter
              guessedLetters={guessedLetters}
              letter={letter}
              reveal={reveal}
            >
              {letter}
            </Letter>
          </Border>
        ))}
      </WordContainer>
    );
  },
);

/****************************************************************
              ***************************************
                       Main Component
              ***************************************
*****************************************************************/

export default function App() {
  const getRandomWord = (arr: {}[]) => {
    const obj = arr[Math.floor(Math.random() * arr.length)];
    return obj;
  };

  const BigContainer = styled.div`
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #f0f6fc, #e1f1fe);
  `;

  const Container = styled.div`
    margin: 0 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    min-height: 100vh;
    max-width: 800px;

    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      Fira Sans,
      Droid Sans,
      Helvetica Neue,
      sans-serif;
    position: relative;
    padding-bottom: 10px;

    @media (min-width: 768px) {
      margin: 0 auto;
    }
  `;

  const Title = styled.h1`
    padding: 15px;
  `;

  const EndGame = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: bold;
    color: black;
    @media (min-width: 768px) {
      font-size: 2rem;
    }
  `;

  const TryAgainButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem;
    border: 3px solid black;
    border-radius: 1rem;
    font-size: 2.5rem;
    background: none;
    color: black;
    cursor: pointer;

    &:hover,
    &:focus {
      background: #16a085;
    }

    @media (min-width: 768px) {
      font-size: 2.3rem;
    }
  `;
  const WinnerSpan = styled.span`
    color: green;
  `;
  const LoserSpan = styled.span`
    color: red;
  `;
  const [wordToGuess, setWordToGuess] = useState('');
  const [hintToGuess, setHintToGuess] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const incorrectLetters = guessedLetters.filter(
    (letter) => !wordToGuess.includes(letter),
  );

  const isLoser = incorrectLetters.length >= 6;
  const isWinner = wordToGuess
    .split('')
    .every((letter) => guessedLetters.includes(letter));

  const addGuessedLetter = (letter: string) => {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    }
  };

  const restartGame = () => {
    const obj = getRandomWord(words) as Object;
    const word = Object.values(obj)[0] as string;
    const question = Object.keys(obj)[0];
    setHintToGuess(question);
    setWordToGuess(word);
    setGuessedLetters([]);
  };
  useEffect(() => {
    restartGame();
    // eslint-disable-next-line
  }, []);
  return (
    <BigContainer>
      <Container>
        <Title>Hangman</Title>

        {!(isWinner || isLoser) ? (
          <Drawing numberOfGuesses={incorrectLetters.length} />
        ) : (
          <EndGame>
            {isWinner && <WinnerSpan> 'You are winner!'</WinnerSpan>}
            {isLoser && <LoserSpan>'Nice try...'</LoserSpan>}
          </EndGame>
        )}
        {!(isWinner || isLoser) && (
          <p
            style={{
              marginBottom: '-20px',
              fontSize: '20px',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Question: {hintToGuess} </span>
          </p>
        )}
        <Word
          reveal={isLoser}
          wordToGuess={wordToGuess}
          guessedLetters={guessedLetters}
        />

        {(isWinner || isLoser) && (
          <TryAgainButton onClick={restartGame}>{tryAgainIcon}</TryAgainButton>
        )}

        <Keyboard
          disabled={isWinner || isLoser}
          correctLetters={guessedLetters.filter((letter) =>
            wordToGuess.includes(letter),
          )}
          incorrectLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />
      </Container>
    </BigContainer>
  );
}
