import { useState, useEffect } from 'react';
import { block, For } from 'million/react';

const getWordCount = (text) => text.split(' ').length;
const getWPM = (wordCount, time) => 60000 * wordCount / time;

async function getSentence() {
  const response = await fetch(
    `https://api.quotable.io/quotes/random?minLength=30&maxLength=70`
  );
  return response.json();
}

const StcBlock = block(
  function Sentence({ text, time, wordCount }) {
    return (
      <div>
        <p className='type-mono'>{text}</p>
        <p><i>{`Finished in ${Number(time / 1000).toFixed(2)} seconds.`}</i></p>
      </div>
    );
  }
);

function HealthBar({ status, time, score, currentStc, stopGame }) {
  const [health, setHealth] = useState(1);

  useEffect(() => {
    if (status == 2) {
      setHealth(h => h - 0.00025 * (120 - 0.04 * (score < 50 ? 50 - score : 0) ** 2) / currentStc.length);
      if (health <= 0) {
        stopGame();
      }
    }
  }, [time]);

  useEffect(() => {
    if (status == 2) {
      setHealth(h => h > 0.75 ? 1 : h + 0.25);
    }
  }, [score]);

  useEffect(() => setHealth(1), [status]);

  return (
    <div className="type-health-bar" hidden={status == 0}>
      <div
        className="type-health"
        style={{ width: `${health * 100}%` }}
      ></div>
    </div>
  );
}

function TypingArea({ currentStc, nextStc, status, time, onSentenceCompleted }) {
  const [displayedText, setDisplayedText] = useState([{text: 'Click button above to play!', className: 'type-none'}]);

  const TextBlock = block(({ text, className }) => <div className={className}>{text}</div>);

  useEffect(() => {
    if (status == 1) {
      setDisplayedText([{text: currentStc, className: 'type-gray'}]);
    } else if (status == 2) {
      setDisplayedText([{text: currentStc, className: 'type-none'}]);
    }
  }, [currentStc]);

  useEffect(() => {
    if (status == 0) {
      setDisplayedText([{text: 'Click button above to play!', className: 'type-none'}]);
    } else if (status == 1) {
      setDisplayedText([{text: 'Loading...', className: 'type-gray'}]);
    } else if (status == 2) {
      setDisplayedText([{text: currentStc, className: 'type-none'}]);
    }
  }, [status]);
  
  function handleChange(e) {
    const inputText = e.target.value;
    if (status != 2) {
      e.target.value = '';
      return null;
    }
    let newDisplayedText = [];
    const inputLen = inputText.length;
    if (currentStc.length < inputLen) {
      // show red text & outline
      console.log('input too long');
    } else if (currentStc == inputText) {
      setDisplayedText([nextStc]);
      onSentenceCompleted();
      e.target.value = '';
    } else {
      for (let i = 0; i < inputLen; i++) {
        const char = currentStc[i];
        newDisplayedText.push({
          text: char,
          className: ((char == inputText[i]) ? 'type-green' : 'type-red'),
        });
      }
      newDisplayedText.push({text: currentStc.substring(inputLen), className: 'type-none'});
      setDisplayedText(newDisplayedText);
    }
  }

  return (
    <div>
      <h2 className='type-mono'>
        <For each={displayedText}>
          {({ text, className }) => (
            <TextBlock text={text} className={className} />
          )}
        </For>
      </h2>
      <input
        type="text"
        placeholder="Start typing here..."
        style={{ width: '100%' }}
        onChange={e => handleChange(e)}
        hidden={status == 0}
      />
    </div>
  );
};

function StcLogsArea({ stcLogs }) {
  return (
    <div>
      <For each={stcLogs}>
        {({ text, time, wordCount }) => (
          <StcBlock text={text} time={time} wordCount={wordCount} />
        )}
      </For>
    </div>
  );
};

export default function Game() {
  const [currentStc, setCurrentStc] = useState('');
  const [nextStc, setNextStc] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState(0);  // 0 for not currently playing, 1 for getting ready, 2 for playing
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState();
  const [timeLap, setTimeLap] = useState(0);
  const [stcLogs, setStcLogs] = useState([]);
  const [totalWC, setTotalWC] = useState(0);

  const score = stcLogs.length;
  const endgameMsg = (wpm) => {
    return 'test';
  }

  function playGame() {
    setTime(0);
    setStcLogs([]);
    setTimeLap(0);
    setTotalWC(0);

    setStatus(1);
    getSentence().then((data) => setCurrentStc(data[0].content));
    getSentence().then((data) => setNextStc(data[0].content));
    
    setSubtitle('Get ready... (click on the grey box)');
    setTimeout(() => setSubtitle('Get ready... 3... (click on the grey box)'), 1000);
    setTimeout(() => setSubtitle('Get ready... 2... (click on the grey box)'), 2000);
    setTimeout(() => setSubtitle('Get ready... 1... (click on the grey box)'), 3000);
    setTimeout(() => {
      setSubtitle('TYPE!');
      setStatus(2);
      const id = setInterval(() => setTime(t => t + 10), 10);
      setIntervalId(id);
    }, 4000);
  }

  function onSentenceCompleted() {
    const wordCount = getWordCount(currentStc);
    setTotalWC(totalWC + wordCount);
    pushStcLog({
      text: currentStc,
      time: time - timeLap,
      wordCount: wordCount,
    });
    setTimeLap(time);
    setSubtitle(score + 1);
    setCurrentStc(nextStc);
    getSentence().then((data) => setNextStc(data[0].content));
  }

  function pushStcLog(log) {
    const newStcLogs = [log, ...stcLogs.slice()];
    setStcLogs(newStcLogs);
  }

  function stopGame() {
    clearInterval(intervalId);
    setStatus(0);
    const wpm = getWPM(totalWC, time);
    setSubtitle(wpm.toFixed() + ' wpm, ' + endgameMsg(wpm));
  }

  return (
    <div>
      <center>
        <h2>Type Race</h2>
        <h4>{subtitle}</h4>
        <button hidden={status != 0} onClick={playGame}>Play</button>
      </center>
      <HealthBar
        status={status}
        time={time}
        score={score}
        currentStc={currentStc}
        stopGame={stopGame}
      />
      <TypingArea
        currentStc={currentStc}
        nextStc={nextStc}
        status={status}
        time={time}
        onSentenceCompleted={onSentenceCompleted}
      />
      <StcLogsArea stcLogs={stcLogs} />
    </div>
  );
}
