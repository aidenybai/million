import React, { useState, useEffect } from 'react';
import { block } from 'million/react';
import { BiReset } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { Card, CardContent, CardHeader, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '300px',
    transformStyle: 'preserve-3d',
    perspective: '1000px',
    transition: 'transform 1000ms ease-in',
    cursor: 'pointer',
    '& .MuiCardHeader-root': {
      color: '#EEEEEE',
      background:
        'radial-gradient(circle at 17% 1%, rgba(198, 198, 198,0.03) 0%, rgba(198, 198, 198,0.03) 50%,rgba(42, 42, 42,0.03) 50%, rgba(42, 42, 42,0.03) 100%),radial-gradient(circle at 8% 81%, rgba(253, 253, 253,0.03) 0%, rgba(253, 253, 253,0.03) 50%,rgba(36, 36, 36,0.03) 50%, rgba(36, 36, 36,0.03) 100%),radial-gradient(circle at 83% 29%, rgba(164, 164, 164,0.03) 0%, rgba(164, 164, 164,0.03) 50%,rgba(60, 60, 60,0.03) 50%, rgba(60, 60, 60,0.03) 100%),radial-gradient(circle at 96% 62%, rgba(170, 170, 170,0.03) 0%, rgba(170, 170, 170,0.03) 50%,rgba(169, 169, 169,0.03) 50%, rgba(169, 169, 169,0.03) 100%),linear-gradient(338deg, rgb(2, 141, 213),rgb(5, 172, 81))',
    },
    '& .MuiCardContent-root': {
      background:
        'linear-gradient(45deg, rgba(86, 86, 86,0.04) 0%, rgba(86, 86, 86,0.04) 50%,rgba(169, 169, 169,0.04) 50%, rgba(169, 169, 169,0.04) 71%,rgba(251, 251, 251,0.04) 71%, rgba(251, 251, 251,0.04) 100%), linear-gradient(45deg, rgba(86, 86, 86,0.04) 0%, rgba(86, 86, 86,0.04) 56%,rgba(169, 169, 169,0.04) 56%, rgba(169, 169, 169,0.04) 67%,rgba(251, 251, 251,0.04) 67%, rgba(251, 251, 251,0.04) 100%), linear-gradient(135deg, rgba(86, 86, 86,0.04) 0%, rgba(86, 86, 86,0.04) 4%,rgba(169, 169, 169,0.04) 4%, rgba(169, 169, 169,0.04) 75%,rgba(251, 251, 251,0.04) 75%, rgba(251, 251, 251,0.04) 100%), linear-gradient(90deg, rgb(0,0,0),rgb(0,0,0))',
      color: '#EEEEEE',
      minHeight: '25vh',
    },
    '& .MuiButtonBase-root': {
      color: 'white',
    },
    '& .MuiCardHeader-action': {
      alignSelf: 'auto',
      marginTop: 0,
      marginLeft: 8,
    },
  },
  flipped: {
    transform: 'rotateY(360deg)',
  },
});

const FlashCard: React.FC<{
  title: string;
  word: string;
  definition: string;
  isFlipped: boolean;
}> = block(({ title, word, definition, isFlipped }) => {
  const classes = useStyles();

  return (
    <Card
      className={`${classes.root} ${isFlipped ? classes.flipped : ''}`}
      elevation={24}
      key="front"
    >
      <CardHeader
        title={isFlipped ? 'Answer' : title}
        className={classes.root}
      />
      <CardContent>
        <CardContent>{isFlipped ? word : definition}</CardContent>
      </CardContent>
    </Card>
  );
});

const VocabularyQuiz: React.FC = block(() => {
  const vocabularyData = [
    {
      title: 'Question 1',
      word: 'abundant',
      definition: 'Existing in large quantities; plentiful.',
    },
    {
      title: 'Question 2',
      word: 'benevolent',
      definition: 'Kindly and well-meaning.',
    },
    {
      title: 'Question 3',
      word: 'cacophony',
      definition: 'A harsh, discordant mixture of sounds.',
    },
    {
      title: 'Question 4',
      word: 'diligent',
      definition:
        "Having or showing care and conscientiousness in one's work or duties.",
    },
    {
      title: 'Question 5',
      word: 'ephemeral',
      definition: 'Lasting for a very short time.',
    },
  ];

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState(
    Array(vocabularyData[currentCardIndex].word.length).fill(''),
  );
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [check, setIsCheck] = useState(false);
  const [randomIndices, setRandomIndices] = useState<number[]>();
  const current = vocabularyData[currentCardIndex].word;
  const currentWord = current.split('');

  const getRandomIndices = (length: number, count: number) => {
    const indices: number[] = [];
    while (indices.length < count) {
      const randomIndex = Math.floor(Math.random() * length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices;
  };

  useEffect(() => {
    reset();
    setRandomIndices(getRandomIndices(current.length, 4));
  }, [currentCardIndex]);

  const reset = () => {
    setIsCheck(false);
    setIsFlipped(false);
    setUserInput(Array(vocabularyData[currentCardIndex].word.length).fill(''));
  };

  const nextCard = () => {
    if (currentCardIndex < vocabularyData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    setIsFlipped(false);
    setIsAnswerCorrect(false);
    setUserInput(Array(vocabularyData[currentCardIndex].word.length).fill(''));
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
    setIsFlipped(false);
    setIsAnswerCorrect(false);
    setUserInput(Array(vocabularyData[currentCardIndex].word.length).fill(''));
  };

  const showAnswer = () => {
    setIsFlipped(true);
  };

  const handleCheckAnswer = () => {
    const fullWord = vocabularyData[currentCardIndex].word.toLowerCase();
    let newInput = [...userInput];
    randomIndices?.forEach((idx) => {
      newInput[idx] = currentWord[idx];
    });
    if (fullWord === newInput.join('').toLowerCase()) {
      setIsAnswerCorrect(true);
      setIsFlipped(true);
    } else {
      setIsAnswerCorrect(false);
    }
    setIsCheck(true);
  };

  const gameStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    margin: '0 10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  };

  return (
    <div style={gameStyle}>
      <FlashCard
        title={vocabularyData[currentCardIndex].title}
        isFlipped={isFlipped}
        definition={vocabularyData[currentCardIndex].definition}
        word={vocabularyData[currentCardIndex].word}
      />
      <div>
        <div>
          <span>
            {isFlipped
              ? vocabularyData[currentCardIndex].definition
              : currentWord.map((letter, index) => (
                  <input
                    key={index}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '5px',
                      marginTop: '10px',
                      fontFamily: 'sans-serif',
                      fontWeight: 'bold',
                      color: 'green',
                    }}
                    type="text"
                    value={
                      randomIndices?.includes(index) ? letter : userInput[index]
                    }
                    disabled={randomIndices?.includes(index)}
                    onChange={(e) => {
                      const newInput = [...userInput];
                      newInput[index] = e.target.value.charAt(0);
                      setUserInput(newInput);
                    }}
                  />
                ))}
          </span>
        </div>
      </div>

      <button style={{ marginTop: '10px' }} onClick={handleCheckAnswer}>
        Check
      </button>
      {check && isAnswerCorrect && (
        <p>
          Correct!
          <FaCheck style={{ color: 'green' }} />
        </p>
      )}
      {check && !isAnswerCorrect && isAnswerCorrect !== null && (
        <>
          <p>
            Incorrect <RxCross2 style={{ color: 'red' }} />
          </p>
          <button type="reset" style={buttonStyle} onClick={showAnswer}>
            Show Answer
          </button>
        </>
      )}

      <div style={{ marginTop: '20px' }}>
        <button type="reset" style={buttonStyle} onClick={reset}>
          <BiReset />
          Reset
        </button>
        <button
          style={buttonStyle}
          onClick={prevCard}
          disabled={currentCardIndex === 0}
        >
          Previous
        </button>
        <button
          style={buttonStyle}
          onClick={nextCard}
          disabled={currentCardIndex === vocabularyData.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default VocabularyQuiz;
