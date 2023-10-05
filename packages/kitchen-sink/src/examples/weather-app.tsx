import styled from 'styled-components';
import { useState } from 'react';
import React from 'react';
import { block } from 'million/react';

const Condition = styled.span`
  margin: 20px auto;
  text-transform: capitalize;
  font-size: 14px;
  & span {
    font-size: 28px;
  }
`;

const SearchBox = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 20px;
  border: black solid 1px;
  border-radius: 2px;

  & input {
    padding: 10px;
    font-size: 14px;
    border: none;
    outline: none;
    font-family: Montserrat;
    font-weight: bold;
  }
  & button {
    background-color: blue;
    font-size: 14px;
    padding: 0 10px;
    color: white;
    border: none;
    outline: none;
    cursor: pointer;
    font-family: Montserrat;
    font-weight: bold;
  }
`;
const ChooseCityLabel = styled.span`
  color: white;
  margin: 10px auto;
  font-size: 18px;
  font-weight: bold;
`;
const WelcomeWeatherLogo = styled.img`
  width: 140px;
  height: 140px;
  margin: 40px auto;
`;

type Weather = {
  city: string;
  weatherDesc: string | undefined;
  temp: any;
};

const WeatherComponent = block(({ city, weatherDesc, temp }: Weather) => {
  return (
    <div>
      <Condition>
        <span>
          {typeof temp === 'number' ? (
            <Condition>
              <span>{`${Math.floor(temp - 273)}°C`}</span>
            </Condition>
          ) : (
            <h1>NOT DEFINED</h1>
          )}
        </span>
        {`  |  ${weatherDesc}`}
      </Condition>
      <h3 style={{ textAlign: 'center' }}>{city.toUpperCase()}</h3>
    </div>
  );
});

export default function Weather() {
  const [city, updatecity] = useState<string | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatecity(event.target.value);
  };
  const [weather, updateWeather] = useState();
  const [temp, updatetemp] = useState();
  const [weatherDesc, updateWeatherDesc] = useState();
  const fetchWeather = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=fe4feefa8543e06d4f3c66d92c61b69c`,
    );
    const data = await response.json();
    updateWeather(data.weather[0].main);
    updateWeatherDesc(data.weather[0].description);
    updatetemp(data.main.temp);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '380px',
        padding: '20px 10px',
        margin: 'auto',
        borderRadius: '4px',
        background: '#252525',
        fontFamily: 'Montserrat',
        color: 'white',
      }}
    >
      <span
        style={{
          color: 'white',
          margin: '20px auto',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Weather App
      </span>
      {city && weather ? (
        <>
          <WeatherComponent city={city} weatherDesc={weatherDesc} temp={temp} />
        </>
      ) : (
        <>
          <WelcomeWeatherLogo
            src={
              'https://ayushkul.github.io/react-weather-app/icons/perfect-day.svg'
            }
          />
          <ChooseCityLabel>Find Weather of your city</ChooseCityLabel>
          <SearchBox
            onSubmit={async (e) => {
              e.preventDefault();
              await fetchWeather(e);
            }}
          >
            <input onChange={handleChange} placeholder="City" />
            <button type={'submit'}>Search</button>
          </SearchBox>
        </>
      )}
    </div>
  );
}
