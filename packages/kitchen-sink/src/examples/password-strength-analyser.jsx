import React, { useState, useEffect } from 'react';

function PasswordStrengthIndicator() {
  const [passwordValue, setPasswordValue] = useState('');
  const [weaknesses, setWeaknesses] = useState([]);
  const [strength, setStrength] = useState(100);

  useEffect(() => {
    updateStrengthMeter();
  }, [passwordValue]);

  function updateStrengthMeter() {
    const calculatedWeaknesses = calculatePasswordStrength(passwordValue);

    let strength = 100;
    const reasonsContainer = [];

    calculatedWeaknesses.forEach((weakness) => {
      if (weakness == null) return;
      strength -= weakness.deduction;
      reasonsContainer.push(<div key={reasonsContainer.length}>{weakness.message}</div>);
    });

    setWeaknesses(reasonsContainer);
    setStrength(strength);
  }

  function calculatePasswordStrength(password) {
    const weaknesses = [];
    weaknesses.push(lengthWeakness(password));
    weaknesses.push(lowercaseWeakness(password));
    weaknesses.push(uppercaseWeakness(password));
    weaknesses.push(numberWeakness(password));
    weaknesses.push(specialCharactersWeakness(password));
    weaknesses.push(repeatCharactersWeakness(password));
    return weaknesses;
  }

  function lengthWeakness(password) {
    const length = password.length;

    if (length <= 5) {
      return {
        message: 'Your password is too short',
        deduction: 40,
      };
    }

    if (length <= 10) {
      return {
        message: 'Your password could be longer',
        deduction: 15,
      };
    }
  }

  function uppercaseWeakness(password) {
    return characterTypeWeakness(password, /[A-Z]/g, 'uppercase characters');
  }

  function lowercaseWeakness(password) {
    return characterTypeWeakness(password, /[a-z]/g, 'lowercase characters');
  }

  function numberWeakness(password) {
    return characterTypeWeakness(password, /[0-9]/g, 'numbers');
  }

  function specialCharactersWeakness(password) {
    return characterTypeWeakness(password, /[^0-9a-zA-Z\s]/g, 'special characters');
  }

  function characterTypeWeakness(password, regex, type) {
    const matches = password.match(regex) || [];

    if (matches.length === 0) {
      return {
        message: `Your password has no ${type}`,
        deduction: 20,
      };
    }

    if (matches.length <= 2) {
      return {
        message: `Your password could use more ${type}`,
        deduction: 5,
      };
    }
  }

  function repeatCharactersWeakness(password) {
    const matches = password.match(/(.)\1/g) || [];
    if (matches.length > 0) {
      return {
        message: 'Your password has repeat characters',
        deduction: matches.length * 10,
      };
    }
  }

  return (
    <div>
      <h1>Password Strength Analyser</h1>
      <div className="strength-meter" style={{ '--strength': strength }} />
      <div style={{display:"flex",alignItems:"center",gap:"10px",margin:'5px'}}>
        <input
          className="password-input"
          type="password"
          autoFocus
          aria-labelledby="password"
          onChange={(e) => {
            setPasswordValue(e.target.value);
          }}
        />
        <button onClick={()=>{
          window.navigator.clipboard.writeText(passwordValue);
        }}>Copy</button>
        
      </div>
      <div className="reasons">{weaknesses}</div>
    </div>
  );
}

export default PasswordStrengthIndicator;
