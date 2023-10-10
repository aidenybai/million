import { block, Page } from 'million';
import React, { useState } from 'react';

const SpeechRecognitionBlock = block(function SpeechRecognitionComponent() {
  const [textToCopy, setTextToCopy] = useState();
  const [isCopied, setCopied] = useState(false);

  const startListening = () => {
     SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    
  };

  const stopListening = () => {
  SpeechRecognition.stopListening();
  };

  
  const transcript = 'This is a sample transcript';

  return (
    <div className="container">
      <h2>Speech Detector</h2>
      <br />
      <p>Start speaking and your speech is translated into words and displayed dynamically!!</p>

      <div className="main-content" onClick={() => setTextToCopy(transcript)}>
        {transcript}
      </div>

      <div className="btn-style">
        <button onClick={() => setCopied(!isCopied)}>
          {isCopied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button onClick={startListening}>Start Speaking</button>
        <button onClick={stopListening}>Stop Speaking</button>
      </div>
    </div>
  );
});

// Export your Million.js block component
export default SpeechRecognitionBlock;


import { render } from 'million';
import SpeechRecognitionBlock from './SpeechRecognitionBlock'; 

function App() {
  return (
    <Page>
      <h1>Welcome to My Million.js App</h1>
      <SpeechRecognitionBlock /> {/* Use the SpeechRecognitionBlock component */}
    </Page>
  );
}


render(<App />);
