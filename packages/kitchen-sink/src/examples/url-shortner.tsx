import { block } from 'million/react';
import { useState } from 'react';

const UrlShortener = block(() => {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');

  const shortenUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://api.shrtco.de/v2/shorten?url=${url}`
      );
      const data = await response.json();
      setShortenedUrl(data.result.full_short_link);
    } catch (e) {
      alert(e);
    }
  };

  const redirectToUrl = () => {
    if (shortenedUrl) {
      window.open(shortenedUrl, '_blank');
    }
  };

  return (
    <div className="app">
      <div className="shortener">
        <h2>URL Shortener</h2>
        <form onSubmit={shortenUrl}>
          <input
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        {shortenedUrl && (
          <div>
            <p>Shortened URL:</p>
            <a href={shortenedUrl} onClick={redirectToUrl}>
              {shortenedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

export default UrlShortener;
