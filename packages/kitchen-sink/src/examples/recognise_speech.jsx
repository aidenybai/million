import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { block } from 'million/react';

const App = () => {
  const [textToCopy, setTextToCopy] = useState('');
  const [isCopied, setCopied] = useState(false);

  const startListening = () => {
    
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  };

  const stopListening = () => {
    
    SpeechRecognition.stopListening();
  };

 
  const transcript = 'This is a sample transcript';

  
  const { transcript: speechTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();


  if (speechTranscript !== textToCopy) {
    setTextToCopy(speechTranscript);
  }

  return (
    <>
      <div className="container">
        <h2>Speech Detector</h2>
        <br />
        <p>Start speaking, and your speech is translated into words and displayed dynamically!!</p>

        <div className="main-content" onClick={() => setTextToCopy(transcript)}>
          {textToCopy}
        </div>

        <div className="btn-style">
          <button onClick={() => setCopied(!isCopied)}>
            {isCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          <button onClick={startListening}>Start Speaking</button>
          <button onClick={stopListening}>Stop Speaking</button>
        </div>
      </div>
    </>
  );
};

export default block(App);
