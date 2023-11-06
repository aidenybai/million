import React, { useState, useEffect } from 'react';
import { block } from 'million/react';
import StartSVG from '../../assets/play.svg';
import StopSVG from '../../assets/stop.svg';
import FlagSVG from '../../assets/flag.svg';
import ResetSVG from '../../assets/close.svg';

const CountDownTimer = block(function TimerComponent() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [recordedTimes, setRecordedTimes] = useState([]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const recordTime = () => {
    const currentTime = `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s ${milliseconds
      .toString()
      .padStart(2, '0')}ms`;
    setRecordedTimes([...recordedTimes, currentTime]);
  };

  const handleHourChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setHours(value);
    }
  };

  const handleMinuteChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setMinutes(value);
    }
  };

  const resetTimer = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setMilliseconds(0);
  };

  const clearFlagData = () => {
    setRecordedTimes([]);
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        if (
          hours === 0 &&
          minutes === 0 &&
          seconds === 0 &&
          milliseconds === 0
        ) {
          clearInterval(interval);
          setIsRunning(false);
        } else {
          if (milliseconds > 0) {
            setMilliseconds(milliseconds - 1);
          } else {
            if (seconds > 0) {
              setSeconds(seconds - 1);
              setMilliseconds(99);
            } else {
              if (minutes > 0) {
                setMinutes(minutes - 1);
                setSeconds(59);
                setMilliseconds(99);
              } else {
                if (hours > 0) {
                  setHours(hours - 1);
                  setMinutes(59);
                  setSeconds(59);
                  setMilliseconds(99);
                }
              }
            }
          }
        }
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, hours, minutes, seconds, milliseconds]);

  return (
    <main>
      <h2 style={{ fontSize: '2.8rem', textAlign: 'center' }}>
        {`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`}
      </h2>

      <section
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <label htmlFor="hourInput">Hours</label>
          <input
            id="hourInput"
            type="number"
            value={hours}
            onChange={handleHourChange}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <label htmlFor="minuteInput">Minutes</label>
          <input
            id="minuteInput"
            type="number"
            value={minutes}
            onChange={handleMinuteChange}
          />
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginBlock: '30px',
        }}
      >
        <button
          onClick={startTimer}
          style={{
            backgroundColor: '#FF0054',
            borderRadius: '100px',
            border: '0px',
          }}
        >
          <img src={StartSVG} alt="play" />
        </button>
        <button
          onClick={stopTimer}
          style={{
            backgroundColor: '#FF0054',
            borderRadius: '100px',
            border: '0px',
          }}
        >
          <img src={StopSVG} alt="stop" />
        </button>
        <button
          onClick={recordTime}
          style={{
            backgroundColor: '#FF0054',
            borderRadius: '100px',
            border: '0px',
          }}
        >
          <img src={FlagSVG} alt="flag" />
        </button>
        <button
          onClick={resetTimer}
          style={{
            backgroundColor: '#FF0054',
            borderRadius: '100px',
            border: '0px',
          }}
        >
          <img src={ResetSVG} alt="reset" />
        </button>
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          // marginTop: '30px',
        }}
      >
        <ul>
          {recordedTimes.map((time, index) => (
            <li key={index}>{time}</li>
          ))}
        </ul>

        {recordedTimes.length > 0 && (
          <button
            onClick={clearFlagData}
            style={{
              backgroundColor: '#00c2cb',
              width: '120px',
              color: 'black',
            }}
          >
            Clear
          </button>
        )}
      </section>
    </main>
  );
});

export default CountDownTimer;
