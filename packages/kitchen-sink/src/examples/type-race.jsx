import { useState } from 'react';
import { block, For } from 'million/react';

const getWordCount = (text) => text.split(' ').length;
const getWPM = (text, time) => getWordCount(text) / time;

async function getSentence() {
  const response = await fetch(
    `https://api.quotable.io/quotes/random?minLength=40&maxLength=100`
  );
  return response.json();
}

const StcBlock = block(({ text, time, wpm, isWPMRecord }) => {
  <div>
    <p>{text}</p>
    <p>{`${time} seconds, ${wpm} wpm. ${isWPMRecord ? 'New WPM record!' : ''}`}</p>
  </div>
});

function HealthBar() {
  return 0;  // TODO: bar design, how to use timeElapsed for health calculation
}

function TypingArea({ isPlaying, pushStcLog }) {
  const [currentStc, setCurrentStc] = useState('');
  const [nextStc, setNextStc] = useState('');
  const [displayedText, setDisplayedText] = useState('Click button above to start playing!');

  /* TODO:
  - how to handle isPlaying
  - how to match typed text with actual text
  - how to move to next sentence
  - how to handle enter key on input
  */

  return (
    <div>
      <h1>{displayedText}</h1>
      <input
        type="text"
        placeholder="Start typing here..."
        style={{ width: '100%' }}    
      />
    </div>
  );
};

function StcLogsArea({ stcLogs }) {
  return (
    <div>
      <For each={stcLogs}>
        {({ text, time, wpm, isWPMRecord }) => (
          <StcBlock text={text} time={time} wpm={wpm} isWPMRecord={isWPMRecord} />
        )}
      </For>
    </div>
  );
};

export default function Game() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stcLogs, setStcLogs] = useState([]);

  const score = stcLogs.length;

  /* TODO:
  - how to handle Play button on click
  - how to keep track of time
  */

  function pushStcLog(log) {
    const newStcLog = stcLogs.slice();
    setStcLogs(newStcLog.push(log));
  }

  return (
    <div>
      <center>
        <h2>Type Race</h2>
        <h4>{ isPlaying ? `Score: ${score}` : <button>Play</button> }</h4>
      </center>
      <HealthBar />
      <TypingArea isPlaying={isPlaying} pushStcLog={pushStcLog} />
      <StcLogsArea stcLogs={stcLogs} />
    </div>
  );
}