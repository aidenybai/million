import { useState, useEffect } from 'react';
import { block, For } from 'million/react';

const getWPM = (charCount, time) => (12000 * charCount) / time;
const endgameMsg = (wpm) => {
  if (wpm == 0) {
    return 'is your keyboard broken? 😭';
  } else if (wpm <= 20) {
    return 'a bit too slow... 😢';
  } else if (wpm <= 40) {
    return 'keep trying! 💪';
  } else if (wpm <= 60) {
    return 'nice! 🤩';
  } else if (wpm <= 80) {
    return 'amazing! 🔥';
  } else if (wpm <= 100) {
    return "you're insane! 😱";
  } else {
    return 'are you even human?! 😱';
  }
};

async function getSentence() {
  const response = await fetch(
    `https://api.quotable.io/quotes/random?minLength=30&maxLength=60`,
  );
  return response.json();
}

const StcBlock = block(function Sentence({ text, time }) {
  return (
    <div>
      <span className="type-mono">{text}</span>{' '}
      <i>{`(${Number(time / 1000).toFixed(2)} seconds)`}</i>
    </div>
  );
});

function HealthBar({ status, time, score, currentStc, stopGame }) {
  const [health, setHealth] = useState(1);

  useEffect(() => {
    if (status == 2) {
      setHealth(
        (h) =>
          h -
          (0.0004 * (120 - 0.04 * (score < 50 ? 50 - score : 0) ** 2)) /
            currentStc.length,
      );
      if (health <= 0) {
        stopGame();
      }
    }
  }, [time]);

  useEffect(() => {
    if (status == 2) {
      setHealth((h) => (h > 0.75 ? 1 : h + 0.25));
    }
  }, [score]);

  useEffect(() => setHealth(1), [status]);

  return (
    <div className="type-health-bar" hidden={status == 0}>
      <div className="type-health" style={{ width: `${health * 100}%` }}></div>
    </div>
  );
}

const TextBlock = block(({ text, className }) => (
  <div className={className}>{text}</div>
));


function TypingArea({
  currentStc,
  nextStc,
  status,
  onSentenceCompleted,
}) {
  const [displayedText, setDisplayedText] = useState([
    { text: 'Test your typing skills!', className: 'type-none' },
  ]);

  useEffect(() => {
    if (status == 1) {
      setDisplayedText([{ text: currentStc, className: 'type-gray' }]);
    } else if (status == 2) {
      setDisplayedText([{ text: currentStc, className: 'type-none' }]);
    }
  }, [currentStc]);

  useEffect(() => {
    if (status == 0) {
      setDisplayedText([
        { text: 'Test your typing skills!', className: 'type-none' },
      ]);
    } else if (status == 1) {
      setDisplayedText([{ text: 'Loading...', className: 'type-gray' }]);
    } else if (status == 2) {
      setDisplayedText([{ text: currentStc, className: 'type-none' }]);
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
    if (currentStc == inputText) {
      setDisplayedText([nextStc]);
      onSentenceCompleted();
      e.target.value = '';
    } else if (currentStc.length >= inputLen) {
      for (let i = 0; i < inputLen; i++) {
        const char = currentStc[i];
        newDisplayedText.push({
          text: char,
          className: char == inputText[i] ? 'type-green' : 'type-red',
        });
      }
      newDisplayedText.push({
        text: currentStc.substring(inputLen),
        className: 'type-none',
      });
      setDisplayedText(newDisplayedText);
    }
  }

  return (
    <div>
      <h2 className="type-mono">
        <For each={displayedText}>
          {({ text, className }) => (
            <TextBlock text={text} className={className} />
          )}
        </For>
      </h2>
      <input
        type="text"
        placeholder="Start typing here..."
        style={{ width: '90%' }}
        onChange={(e) => handleChange(e)}
        hidden={status == 0}
      />
    </div>
  );
}

const StcLogsArea = ({ stcLogs }) => {
  return (
    <div>
      <For each={stcLogs}>
        {({ text, time }) => <StcBlock text={text} time={time} />}
      </For>
    </div>
  );
};

const TypeRace = () => {
  const [currentStc, setCurrentStc] = useState('');
  const [nextStc, setNextStc] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState(0);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState();
  const [timeLap, setTimeLap] = useState(0);
  const [stcLogs, setStcLogs] = useState([]);
  const [totalChar, setTotalChar] = useState(0);

  const score = stcLogs.length;

  function playGame() {
    setTime(0);
    setStcLogs([]);
    setTimeLap(0);
    setTotalChar(0);

    setStatus(1);
    getSentence().then((data) => setCurrentStc(data[0].content));
    getSentence().then((data) => setNextStc(data[0].content));

    setSubtitle('Get ready...');
    setTimeout(() => setSubtitle('3...'), 1000);
    setTimeout(() => setSubtitle('2...'), 2000);
    setTimeout(() => setSubtitle('1...'), 3000);
    setTimeout(() => {
      setSubtitle('TYPE!');
      setStatus(2);
      const id = setInterval(() => setTime((t) => t + 10), 10);
      setIntervalId(id);
    }, 4000);
  }

  function onSentenceCompleted() {
    setTotalChar(totalChar + currentStc.length);
    pushStcLog({
      text: currentStc,
      time: time - timeLap,
    });
    setTimeLap(time);
    setSubtitle(`Score: ${score + 1}`);
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
    const wpm = getWPM(totalChar, time);
    setSubtitle(`Your speed was ${wpm.toFixed()} wpm, ${endgameMsg(wpm)}`);
  }

  return (
    <div>
      <center>
        <h2>Type Race</h2>
        <h4>{subtitle}</h4>
        <button hidden={status != 0} onClick={playGame}>
          Play
        </button>
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
        onSentenceCompleted={onSentenceCompleted}
      />
      <hr />
      <StcLogsArea stcLogs={stcLogs} />
    </div>
  );
};

export default TypeRace;
