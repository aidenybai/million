import React from 'react';
import { block } from 'million/react';

interface MovieProps {
  Poster: string;
  Title: string;
  Genre: string;
  Released: string;
  Rated: string;
  Plot: string;
  Actors: string;
  Writer: string;
  Director: string;
  Awards: string;
  Rating: string;
  Response: string;
}

const MovieFinder = block(() => {
  const [query, setQuery] = React.useState<string>('');
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [movie, setMovie] = React.useState<MovieProps | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=c383ad63&t=${query}`,
      );
      const data = await res.json();
      setMovie(data);
    } catch (error: any) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          value={query}
          placeholder="Name a movie & I'll do the rest "
          style={{ width: '40%', padding: '10px' }}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchMovies} disabled={isLoading === true}>
          Search
        </button>
      </div>
      <div style={{ paddingTop: '15px' }}>
        {movie?.Response !== 'False' && movie ? (
          <>
            <img src={movie.Poster} />
            <h3>Title: {movie.Title}</h3>
            <p>Genre: {movie.Genre} </p>
            <p>Released: {movie.Released} </p>
            <p>Rated: {movie.Rated} </p>
            <p>Plot: {movie.Plot} </p>
            <p>Actors: {movie.Actors} </p>
            <p>Writer: {movie.Writer} </p>
            <p>Director: {movie.Director} </p>
            <p>Awards: {movie.Awards} </p>
          </>
        ) : null}
      </div>
    </div>
  );
});

export default MovieFinder;
