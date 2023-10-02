import  { useState } from 'react';
import { block } from 'million/react';
import styled from 'styled-components';

const QuizContainer = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const QuestionContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const QuestionText = styled.h2`
  margin-bottom: 10px;
`;

const OptionsContainer = styled.form`
  display: flex;
  flex-direction: column;
`;

const OptionLabel = styled.label`
  display: block;
  margin-bottom: 10px;
`;

const OptionInput = styled.input`
  margin-right: 5px;
`;

const NextButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const Quiz = block(() => {
  const questions = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
      correctAnswer: 'Mars',
    },
    {
      question: 'What is the largest mammal in the world?',
      options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
      correctAnswer: 'Blue Whale',
    },
    {
      question: 'What is the chemical symbol for the element oxygen?',
      options: ['O', 'Ox', 'O2', 'Oxg'],
      correctAnswer: 'O',
    },
    {
      question: 'Which gas do plants absorb from the atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 'Carbon Dioxide',
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);

  const handleOptionChange = (event:any) => {
    setSelectedOption(event.target.value);
  };

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setSelectedOption('');
    setCurrentQuestion(currentQuestion + 1);
  };

  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <QuizContainer>
      <h1>Quiz App</h1>
      {currentQuestion < questions.length ? (
        <QuestionContainer>
          <QuestionText>Question {currentQuestion + 1}</QuestionText>
          <p>{questions[currentQuestion].question}</p>
          <OptionsContainer>
            {questions[currentQuestion].options.map((option, index) => (
              <OptionLabel key={index}>
                <OptionInput
                  type="radio"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                />
                {option}
              </OptionLabel>
            ))}
          </OptionsContainer>
          <NextButton onClick={handleNextQuestion}>
            {isLastQuestion ? 'Finish' : 'Next'}
          </NextButton>
        </QuestionContainer>
      ) : (
        <div>
          <h2>Quiz Completed!</h2>
          <p>Your Score: {score} out of {questions.length}</p>
        </div>
      )}
    </QuizContainer>
  );
});

export default Quiz;
