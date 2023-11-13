import React, { useState } from 'react';
import { block } from 'million/react';

const morseCode = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',
};

const morseCodeGuideAlphabets = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
};

const morseCodeGuideNumerical = {
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',
};

const MorseCodeTranslator = block(() => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showMorseGuide, setShowMorseGuide] = useState(false);

  const translateToMorse = () => {
    let text = inputText.toUpperCase();
    let morseResult = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        morseResult += ' ';
      } else if (morseCode[char]) {
        morseResult += morseCode[char] + ' ';
      }
    }
    setTranslatedText(morseResult.trim());
  };

  const translateToText = () => {
    const morseArray = inputText.trim().split(' ');
    let textResult = '';
    for (let i = 0; i < morseArray.length; i++) {
      const morse = morseArray[i];
      if (morse === '') {
        textResult += ' ';
      } else {
        for (const key in morseCode) {
          if (morseCode[key] === morse) {
            textResult += key;
          }
        }
      }
    }
    setTranslatedText(textResult);
  };
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Morse Code Translator</h1>
      <div
        style={{
          border: '2px solid salmon',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '20px',
          padding: '20px',
          color: '#DDFFD9',
          fontSize: '22px',
        }}
      >
        <p style={{ fontSize: '28px' }}>
          {translatedText ? (
            translatedText
          ) : (
            <span style={{ color: 'dimgray' }}>Translated Data</span>
          )}
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <textarea
          style={{
            marginTop: '20px',
            width: '280px',
            height: '60px',
            border: 'none',
            backgroundColor: '#353535',
            padding: '0.55rem',
            color: '#f7f7f7',
            borderRadius: '0.25rem',
          }}
          rows="6"
          placeholder="Enter Text or Morse Code"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
      </div>

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={translateToMorse}>Translate to Morse</button>
          <button onClick={translateToText}>Translate to Text</button>
          <button onClick={() => setShowMorseGuide(!showMorseGuide)}>
            {showMorseGuide ? 'Hide Morse Guide' : 'Show Morse Guide'}
          </button>
        </div>
      </div>

      {showMorseGuide && (
        <div>
          <h2 style={{ textAlign: 'center' }}>
            Morse Code Guide for Alphabets!
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {Object.keys(morseCodeGuideAlphabets).map((key) => (
              <div key={key} style={{ margin: '10px', textAlign: 'center' }}>
                {key}: {morseCodeGuideAlphabets[key]}
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ textAlign: 'center' }}>
              Morse Code Guide for Numerical!
            </h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {Object.keys(morseCodeGuideNumerical).map((key) => (
                <div key={key} style={{ margin: '10px', textAlign: 'center' }}>
                  {key}: {morseCodeGuideNumerical[key]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MorseCodeTranslator;
