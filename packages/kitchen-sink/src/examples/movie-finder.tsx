import React from 'react';
import { block } from 'million/react';

interface MovieProps {
  title: string;
  release_date: string;
  Rated: string;
  overview: string;
}

const MovieFinder = block(() => {
  const [query, setQuery] = React.useState<string>('');
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [movie, setMovie] = React.useState<MovieProps | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=7375b3162ed1bb2f24bb965386019997`,
      );
      const data = await res.json();
      setMovie(data.results[0]);
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
        {movie && (
          <>
            <h3>Title: {movie.title}</h3>
            <p>Released: {movie.release_date} </p>
            <p>Plot: {movie.overview} </p>
          </>
        )}
      </div>
    </div>
  );
});

export default MovieFinder;
