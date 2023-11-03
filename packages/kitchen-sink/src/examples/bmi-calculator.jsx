import React, { useState } from 'react';
import { block } from 'million/react';
import '../css/examples/bmi-calculator.css';

const BmiCalculator = block(function BmiComponent() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateBmi = () => {
    if (
      age === '' ||
      heightFeet === '' ||
      heightInches === '' ||
      weight === ''
    ) {
      setErrorMessage('Please fill in all fields.');
      return;
    } else {
      setErrorMessage('');
    }

    const heightInCentimeters =
      parseInt(heightFeet, 10) * 30.48 + parseInt(heightInches, 10) * 2.54;
    const heightInMeters = heightInCentimeters / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    const finalBmi = parseFloat(calculatedBmi.toFixed(2));
    setBmi(finalBmi);

    if (finalBmi < 18.5) {
      setBmiCategory('Underweight');
    } else if (finalBmi >= 18.5 && finalBmi < 24.9) {
      setBmiCategory('Normal');
    } else if (finalBmi >= 25 && finalBmi < 29.9) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obese');
    }
  };

  return (
    <main className="bmi-calculator">
      <h2>BMI Calculator</h2>
      <div className="bmi-calculator_wrapper">
        <div className="form-input-group">
          <label>Age*:</label>
          <input
            type="number"
            placeholder="Enter your age"
            min={1}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-input-group">
          <label>Gender*:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="form-input-group">
          <label>Height (enter feet)*:</label>
          <input
            type="number"
            placeholder="Enter your height in feet"
            value={heightFeet}
            onChange={(e) => setHeightFeet(e.target.value)}
            min={1}
          />
        </div>

        <div className="form-input-group">
          <label>Height (enter inches)*:</label>
          <input
            type="number"
            placeholder="Enter your height in inch"
            value={heightInches}
            onChange={(e) => setHeightInches(e.target.value)}
            min={1}
          />
        </div>

        <div className="form-input-group">
          <label>Weight (in kg)*:</label>
          <input
            type="number"
            placeholder="Enter you weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min={1}
          />
        </div>
        <div className="form-input-group">
          <button type="button" onClick={calculateBmi}>
            Calculate BMI
          </button>
        </div>
      </div>

      {errorMessage && (
        <p style={{ color: 'tomato', textAlign: 'center' }}>{errorMessage}</p>
      )}

      {bmi !== null && (
        <div
          style={{
            border: '2px solid gold',
            marginTop: '30px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p>
            Your BMI: <b>{bmi}</b>
          </p>
          <p>
            Category: <b>{bmiCategory}</b>
          </p>
        </div>
      )}
    </main>
  );
});

export default BmiCalculator;
