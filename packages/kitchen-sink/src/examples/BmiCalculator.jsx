import React, { useState } from 'react';
import { block } from "million/react";

const BmiCalculator = block( function BmiComponent() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateBmi = () => {
    if (age === '' || heightFeet === '' || heightInches === '' || weight === '') {
      setErrorMessage('Please fill in all fields.');
      return;
    } else {
      setErrorMessage('');
    }

    const heightInCentimeters = (parseInt(heightFeet, 10) * 30.48) + (parseInt(heightInches, 10) * 2.54);
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
    <div>
      <h1 style={{textAlign:'center'}}>BMI Calculator</h1>
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:'20px'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>Age * :</label>
            <input type="number" placeholder='Enter your age' value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>Gender * :</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
            style={{width:'230px',height:'40px',border:'none',backgroundColor:'#353535',padding:'0.55rem',color:'#f7f7f7',borderRadius:'0.25rem'}}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',marginTop:'20px'}}>
        <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:'20px'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>Height (in feet and inches) * :</label>
            <input type="number" placeholder="Enter your height in feet" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
          </div>

          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>&nbsp;</label>
            <input type="number" placeholder="Enter your height in inch" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',marginTop:'20px'}}>
        <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:'20px'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>Weight (in kg) * :</label>
            <input type="number" placeholder='Enter you weight' value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>

          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <label>&nbsp;</label>
            <button type="button" onClick={calculateBmi} style={{width:'230px',color:'black',backgroundColor:'orange'}}>Calculate BMI</button>
          </div>
        </div>
      </div>

      {errorMessage && <p style={{color:'darksalmon',textAlign:'center'}}>{errorMessage}</p>}

      {bmi !== null && (
        <div style={{border:'2px solid yellow',marginTop:'20px',padding:'20px'}}>
          <p style={{textAlign:'center',fontSize:'40px',margin:'0px'}}>Your BMI: {bmi}</p>
          <p style={{textAlign:'center',fontSize:'30px',margin:'0px',color:'tomato'}}>Category: {bmiCategory}</p>
        </div>
      )}
    </div>
  );
}
)

export default BmiCalculator;