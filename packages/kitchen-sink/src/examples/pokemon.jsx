import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { block } from 'million/react';

const PokemonListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const PokemonCardWrapper = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  margin: 20px;
  max-width: 300px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const PokemonImage = styled.img`
  max-width: 100%;
  margin-bottom: 10px;
`;

const StatList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StatItem = styled.li`
  font-size: 16px;
  margin: 5px 0;
`;

const LoadMoreButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
`;

const Pokemon = block(() => {
  const [pokemons, setPokemons] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextUrl, setNextUrl] = useState('');

  useEffect(() => {
    axios
      .get('https://pokeapi.co/api/v2/pokemon')
      .then((response) => {
        setPokemons(response.data.results);
        setAllPokemons(response.data.results);
        setNextUrl(response.data.next);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const fetchMorePokemon = () => {
    if (nextUrl) {
      axios
        .get(nextUrl)
        .then((response) => {
          setPokemons((prevPokemons) => [
            ...prevPokemons,
            ...response.data.results,
          ]);
          setAllPokemons((prevPokemons) => [
            ...prevPokemons,
            ...response.data.results,
          ]);
          setNextUrl(response.data.next);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  };

  const handleSearch = () => {
    const filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.includes(searchTerm.toLowerCase()),
    );
    setPokemons(filteredPokemons);
  };

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center' }}>Pokemon List</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Pokemon"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <PokemonListWrapper>
        {pokemons.map((pokemon, index) => (
          <PokemonCard key={index} pokemon={pokemon} />
        ))}
      </PokemonListWrapper>
      {nextUrl && (
        <LoadMoreButton onClick={fetchMorePokemon}>
          Load More Pokémon
        </LoadMoreButton>
      )}
    </div>
  );
});

const PokemonCard = ({ pokemon }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    axios
      .get(pokemon.url)
      .then((response) => {
        setDetails(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [pokemon.url]);

  return (
    <PokemonCardWrapper>
      {details && (
        <>
          <PokemonImage
            src={details.sprites.front_default}
            alt={details.name}
          />
          <h3>{details.name}</h3>
          <h4>Stats:</h4>
          <StatList>
            {details.stats.map((stat, index) => (
              <StatItem key={index}>
                {stat.stat.name}: {stat.base_stat}
              </StatItem>
            ))}
          </StatList>
        </>
      )}
    </PokemonCardWrapper>
  );
};

export default Pokemon;
