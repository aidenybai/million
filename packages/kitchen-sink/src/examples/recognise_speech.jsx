// import React, { useState } from "react";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import useClipboard from "react-use-clipboard";
// import './App.css';
// const App = () => {
//   const [textToCopy, setTextToCopy] = useState("");
//   const [isCopied, setCopied] = useClipboard(textToCopy, {
//     successDuration: 1000,
//   });
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  
//   const speakText = () => {
//     if ('speechSynthesis' in window) {
//       const synth = window.speechSynthesis;
//       const utterance = new SpeechSynthesisUtterance(textToCopy);
//       synth.speak(utterance);
//     }
//   };

//   if (!browserSupportsSpeechRecognition) {
//     return null;
//   }

//   return (
//     <>
//       <div className="container">
//         <h2>Speech Detector</h2>
//         <br />
//         <p>
//           Start speeking and your speech are translated into words and they are displayed dynamically!!
//         </p>

//         <div className="main-content" onClick={() => setTextToCopy(transcript)}>
//           {transcript}
//         </div>

//         <div className="btn-style">
//           <button onClick={setCopied}>
//             {isCopied ? "Copied!" : "Copy to clipboard"}
//           </button>
//           <button onClick={speakText}>Get Speech</button>
//           <button onClick={SpeechRecognition.startListening}>Start Speeking</button>
//           <button onClick={SpeechRecognition.stopListening}>Stop Speeking</button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default App;

import "./App.css"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import {useState} from "react";


const App = () => {
    const [textToCopy, setTextToCopy] = useState();
    const [isCopied, setCopied] = useClipboard(textToCopy, {
        successDuration:1000
    });

    

    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return null
    }

    return (
        <>
            <div className="container">
                <h2>Speech Detector</h2>
                <br/>
                <p>Start speeking and your speech is translated into words and they are displayed dynamically!!</p>

                <div className="main-content" onClick={() =>  setTextToCopy(transcript)}>
                    {transcript}
                </div>

                <div className="btn-style">

                    <button onClick={setCopied}>
                        {isCopied ? 'Copied!' : 'Copy to clipboard'}
                    </button>
                    <button onClick={startListening}>Start Speeking</button>
                    <button onClick={SpeechRecognition.stopListening}>Stop Speeking</button>

                </div>

            </div>

        </>
    );
};

export default App;

