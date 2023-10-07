import React, { useEffect, useState } from 'react';
// import styled from "styled-components";
import { block } from 'million/react';

const Header=block(({score})=>{
  return(
    <h1>
        Whack-a-mole! <span className="score">{score}</span>
      </h1>
  )
})

const Button=block(({startGame})=>{
  return(
    <div className="controls">
        <button onClick={startGame}>Start!</button>
      </div>
  )
})

const WhackAMole = () => {
  const [holes, setHoles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [lastHole, setLastHole] = useState(null);
  const [currentHole, setCurrentHole] = useState(null);
  const [timeSet, setTimeSet] = useState(null);
  const [start, setStart] = useState(false);
  const [sett, setSett] = useState(null);

  useEffect(() => {
    const holes = document.querySelectorAll('.hole');
    setHoles(holes);
  }, []);

  const randomHole=(holes) =>{
    if (timeUp == true) {
      console.log('entered');
      clearTimeout(sett);
      setStart(false);
      setLastHole(null);
      holes.forEach((i) => {
        i.classList.remove('up');
      });
      return;
    }
    console.log(holes)
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    // console.log(hole);
    if (hole === lastHole) {
      console.log("Ah nah, that's the same one bud");
      return randomHole(holes);
    }
    setLastHole(hole);
    setCurrentHole(idx);
    // console.log(lastHole?.key);
    return hole;
  }
  function peep() {
    if (timeUp == true) {
      console.log('entered');
      clearTimeout(sett);
      setStart(false);
      setLastHole(null);
      holes.forEach((i) => {
        i.classList.remove('up');
      });
      return;
    }

    const time = 900;
    // const time = randomTime(2000, 10000);
    const hole = randomHole(holes);

    holes?.forEach((i) => {
      i.classList.remove('up');
    });
    hole.classList.add('up');
    setTimeSet(time);
    const sett = setTimeout(() => {
      hole.classList.remove('up');
      if (!timeUp) {
        clearTimeout(sett);
        peep();
      }
    }, time);
    setSett(sett);
    // clearTimeout(sett);
  }

  function startGame() {
    console.log("Started")
    setScore(0);
    setTimeUp(false);
    setStart(true);
    setLastHole(null);
    peep();
    setTimeout(() => setTimeUp(true), 10000);
  }

  function bonk(index) {
    if (timeUp == true) {
      console.log('entered');
      clearTimeout(sett);
      setStart(false);
      setLastHole(null);
      holes.forEach((i) => {
        i.classList.remove('up');
      });
      return;
    }

    if (index !== currentHole) return; // cheater!
    console.log('Correct');
    setScore(score + 1);
    lastHole.classList.remove('up');

    clearTimeout(sett);
    peep();
    // hole.classList.remove('up');
    console.log(timeSet);
    clearTimeout(timeSet);
    setTimeSet(null);
  }
  return (
    <div className='whack_a_mole'>
      <Header score={score}/>
      {timeUp && <div>time out</div>}
      <Button startGame={startGame}/>

      <div className="game">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`hole hole${index + 1}`}
            onClick={() => bonk(index)}
          >
            <div className="mole"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhackAMole;
