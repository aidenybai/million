import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';
import Seyi from '../../assets/seyi.mp3';
import { AiFillPlayCircle, AiFillPauseCircle } from 'react-icons/ai';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import { block } from 'million/react';

const albumArt =
  'https://i0.wp.com/justnaija.com/uploads/2022/11/Seyi-Vibez-Bank-Of-America-artwork.png?ulb=false&ssl=1&resize=320,350';

const MusicPlayer = block(() => {
  return (
    <div className="body">
      <div className="App">
        <div className="music-card">
          <Player />
        </div>
      </div>
    </div>
  );
});

const Player = block(() => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [play, { pause, duration, sound }] = useSound(Seyi);

  const playingButton = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="component">
      <h2>Playing Now</h2>
      <img className="musicCover" src={albumArt} />
      <div>
        <h3 className="title">Man Of The Year</h3>
        <p className="subTitle">Seyi Vibez</p>
      </div>
      <AudioTimeline duration={duration} sound={sound} isPlaying={isPlaying} />
      <div>
        <button className="playButton">
          <IconContext.Provider value={{ size: '3em', color: '#27AE60' }}>
            <BiSkipPrevious />
          </IconContext.Provider>
        </button>
        {!isPlaying ? (
          <button className="playButton" onClick={playingButton}>
            <IconContext.Provider value={{ size: '3em', color: '#27AE60' }}>
              <AiFillPlayCircle />
            </IconContext.Provider>
          </button>
        ) : (
          <button className="playButton" onClick={playingButton}>
            <IconContext.Provider value={{ size: '3em', color: '#27AE60' }}>
              <AiFillPauseCircle />
            </IconContext.Provider>
          </button>
        )}
        <button className="playButton">
          <IconContext.Provider value={{ size: '3em', color: '#27AE60' }}>
            <BiSkipNext />
          </IconContext.Provider>
        </button>
      </div>
    </div>
  );
});

const AudioTimeline = block(({ duration, sound, isPlaying }) => {
  const [currTime, setCurrTime] = useState({
    min: '',
    sec: '',
  });

  const [time, setTime] = useState({
    min: '',
    sec: '',
  });

  const [seconds, setSeconds] = useState(); // current position of the audio in seconds

  useEffect(() => {
    const sec = duration / 1000;
    const min = Math.floor(sec / 60);
    const secRemain = Math.floor(sec % 60);

    setTime({
      min: min,
      sec: secRemain,
    });
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound) {
        setSeconds(sound.seek([])); // set the seconds state with the current state.
        const min = Math.floor(sound.seek([]) / 60);
        const sec = Math.floor(sound.seek([]) % 60);

        setCurrTime({
          min,
          sec,
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sound]);
  return (
    <div>
      <div className="time">
        <p>
          {currTime.min}:{currTime.sec}
        </p>
        <p>
          {time.min}:{time.sec}
        </p>
      </div>
      <input
        type="range"
        min="0"
        max={duration / 1000}
        value={seconds}
        className="timeline"
        onChange={(e) => {
          sound.seek([e.target.value]);
        }}
      />
    </div>
  );
});

export default MusicPlayer;
