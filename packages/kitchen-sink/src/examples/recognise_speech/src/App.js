import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import useClipboard from "react-use-clipboard";
import './App.css';

const App = () => {
  const [textToCopy, setTextToCopy] = useState("");
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 1000,
  });
  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isListening) {
      SpeechRecognition.startListening();
    } else {
      SpeechRecognition.stopListening();
    }
  }, [isListening]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const handleCopyToClipboard = () => {
    if (textToCopy.trim() === "") {
      alert("Text should be present before copying to clipboard.");
    } else {
      setCopied();
    }
  };

  return (
    <>
      <div className="container">
        <h2>Speech Detector</h2>
        <br />
        <p>
          Start speaking, and your speech is translated into words and displayed dynamically!
        </p>

        <div className="main-content" onClick={() => setTextToCopy(transcript)}>
          {transcript}
        </div>

        <div className="btn-style">
          <button onClick={handleCopyToClipboard}>
            {isCopied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button onClick={() => setIsListening(!isListening)}>
            {isListening ? "Stop Speaking" : "Start Speaking"}
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
