import React, { useEffect, useReducer } from 'react';
import { block } from 'million/react';
import styled from 'styled-components';

const SECS_PER_QUESTION = 30;

const QuestionList = {
  questions: [
    {
      question: 'What is a block in Million.js?',
      options: [
        'A type of HTML element',
        'A Higher Order Component',
        'A data structure',
        'A virtual DOM element',
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question: 'How do you use the <For /> component in Million.js?',
      options: [
        'To create a table',
        'To render a list of blocks efficiently',
        'To handle form input',
        'To create animations',
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question: 'When should you use block() in Million.js?',
      options: [
        'To optimize rendering speed',
        'To create React components',
        'To add styles to elements',
        'To handle user input',
      ],
      correctOption: 0,
      points: 10,
    },
    {
      question: 'What is the purpose of the <Table /> component in Million.js?',
      options: [
        'To display a grid of data',
        'To create forms',
        'To handle API requests',
        'To add animations to a webpage',
      ],
      correctOption: 0,
      points: 10,
    },
    {
      question:
        'How can you render a list of blocks efficiently in Million.js?',
      options: [
        'By using Array.map()',
        'By using <For /> component',
        'By using for loops',
        'By using forEach() method',
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question:
        'What is the recommended way to loop over an array in Million.js?',
      options: [
        'Using for loops',
        'Using forEach() method',
        'Using Array.map()',
        'Using while loops',
      ],
      correctOption: 2,
      points: 10,
    },
    {
      question:
        'What is the purpose of the lotsOfElements variable in the documentation?',
      options: [
        'To add random elements to a webpage',
        'To demonstrate rendering performance',
        'To handle user input',
        'To create animations',
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question:
        'What is the primary benefit of using Million.js for rendering large lists?',
      options: [
        'Faster rendering speed',
        'Simpler code',
        'Better support for UI libraries',
        'Easier debugging',
      ],
      correctOption: 0,
      points: 10,
    },
    {
      question:
        'When should you avoid using UI component libraries with Million.js?',
      options: [
        'Always use UI component libraries',
        'Only use UI component libraries',
        'When you want to add animations',
        'When you want to optimize rendering',
      ],
      correctOption: 3,
      points: 10,
    },
    {
      question: 'What is progressive degradation in Million.js?',
      options: [
        'Using the library progressively',
        'Optimizing performance over time',
        'Using features based on what is supported',
        'Enhancing performance with custom components',
      ],
      correctOption: 2,
      points: 10,
    },
  ],
};

const MillionQuiz = () => {
  function reducer(state, action) {
    switch (action.type) {
      case 'dataReceived':
        return {
          ...state,
          questions: action.payload,
          status: 'ready',
        };
      case 'dataFailed':
        return {
          ...state,
          status: 'failed',
        };
      case 'start':
        return {
          ...state,
          status: 'active',
          secondsRemaining: state.questions.length * SECS_PER_QUESTION,
        };
      case 'newAnswer':
        const question = state.questions.at(state.index);
        return {
          ...state,
          answer: action.payload,
          points:
            action.payload === question.correctOption
              ? state.points + question.points
              : state.points,
        };
      case 'nextQuestion':
        return {
          ...state,
          index: state.index + 1,
          answer: null,
        };
      case 'finish':
        return {
          ...state,
          status: 'finished',
          highScore:
            state.points > state.highScore ? state.points : state.highScore,
        };
      case 'restart':
        return {
          ...initialState,
          questions: state.questions,
          status: 'ready',
        };
      case 'tick':
        return {
          ...state,
          secondsRemaining: state.secondsRemaining - 1,
          status: state.secondsRemaining === 0 ? 'finished' : state.status,
        };
      default:
        throw new Error('Action gone wrong');
    }
  }
  const initialState = {
    questions: QuestionList.questions,
    status: 'ready',
    index: 0,
    answer: null,
    points: 0,
    highScore: 0,
    secondsRemaining: null,
  };
  const [
    { questions, status, index, answer, points, highScore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPossibleValue = questions.reduce(
    (prev, curr) => prev + curr.points,
    0,
  );

  return (
    <div className="app">
      <Header />
      <Main className="main">
        {status === 'loading' && <Loader />}
        {status === 'failed' && <Error />}
        {status === 'ready' && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === 'active' && (
          <>
            <Progress
              index={index}
              numQuestion={numQuestions}
              points={points}
              maxPossibleValue={maxPossibleValue}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestion={numQuestions}
                points={points}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === 'finished' && (
          <FinishScreen
            points={points}
            maxPossiblepoint={maxPossibleValue}
            highScore={highScore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

const Error = block(function Error() {
  return (
    <p className="error">
      <span>💥</span> There was an error fecthing questions.
    </p>
  );
});

const FinishScreen = block(function FinishScreen({
  points,
  maxPossiblepoint,
  highScore,
  dispatch,
}) {
  const percentage = (points / maxPossiblepoint) * 100;
  let emoji;
  if (percentage === 100) emoji = '🎖️';
  else emoji = '👏';
  return (
    <>
      <p className="result">
        <spam>{emoji}</spam>Your Score<strong>{points}</strong> out of{' '}
        {maxPossiblepoint} &nbsp; ({Math.ceil(percentage)}%);
      </p>
      <h3>( Highest Score is {highScore} points )</h3>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: 'restart' })}
      >
        Restart Quiz
      </button>
    </>
  );
});

const Footer = block(function Footer({ children }) {
  return <footer>{children}</footer>;
});

const Header = block(function Header() {
  return (
    <header className="app-header">
      <h1>The Million.js Quiz</h1>
    </header>
  );
});

const Loader = block(function Loader() {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Loading questions...</p>
    </div>
  );
});

const Main = block(function Main({ children }) {
  return <main classname="main">{children}</main>;
});

const NextButton = block(function NextButton({
  dispatch,
  answer,
  numQuestion,
  index,
}) {
  console.log(numQuestion, index);
  if (answer === null) return null;
  else if (numQuestion - 1 > index) {
    return (
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: 'nextQuestion' })}
      >
        Next
      </button>
    );
  } else {
    return (
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: 'finish' })}
      >
        Finish
      </button>
    );
  }
});

const Opt = block(function Opt({ question, dispatch, answer }) {
  const hasAnswered = answer !== null;
  const Button = styled.button`
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
  `;

  const CorrectButton = styled(Button)`
    background-color: #1098ad;
    border: 2px solid #1098ad;
    color: #f1f3f5;
    cursor: not-allowed;
  `;

  const WrongButton = styled(Button)`
    background-color: #ffa94d;
    border: 2px solid #ffa94d;
    color: #74509a;
    cursor: not-allowed;
  `;
  return (
    <div className="options">
      {question.options.map((option, index) => (
        <div
          key={option}
          onClick={() => dispatch({ type: 'newAnswer', payload: index })}
        >
          {hasAnswered ? (
            index === question.correctOption ? (
              <CorrectButton>{option}</CorrectButton>
            ) : (
              <WrongButton>{option}</WrongButton>
            )
          ) : (
            <Button>{option}</Button>
          )}
        </div>
      ))}
    </div>
  );
});

const Progress = block(function Progress({
  index,
  numQuestion,
  points,
  maxPossibleValue,
  answer,
}) {
  return (
    <header className="progress">
      <progress max={numQuestion} value={index + Number(answer != null)} />
      <p>
        Question&nbsp;<strong>{index + 1}</strong>/{numQuestion}
      </p>
      <p>
        <strong>
          {points}/{maxPossibleValue}
        </strong>
      </p>
    </header>
  );
});

const Question = block(function Question({ question, dispatch, answer }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <Opt question={question} dispatch={dispatch} answer={answer} />
    </div>
  );
});

const StartScreen = block(function StartScreen({ numQuestions, dispatch }) {
  return (
    <div className="start">
      <h2>Welcome to the Million.js Quiz</h2>
      <h3>{numQuestions} questions to test your Million.js mastery</h3>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: 'start' })}
      >
        Let's Start
      </button>
    </div>
  );
});

const Timer = block(function Timer({ dispatch, secondsRemaining }) {
  const mins = Math.floor(secondsRemaining / 60);
  const sec = secondsRemaining % 60;

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return (
    <div className="timer">
      {mins < 10 ? '0' : ''}
      {mins}:{sec < 10 ? '0' : ''}
      {sec}
    </div>
  );
});

export default MillionQuiz;