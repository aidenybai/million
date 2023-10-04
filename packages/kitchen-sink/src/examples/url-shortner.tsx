import { useState } from 'react';

function App() {
  const [url, setUrl] = useState()
  const [shortendUrl, setShortenedUrl] = useState('')

  const shortenUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://api.shrtco.de/v2/shorten?url=${url}`
      )
      const data = await response.json()
      setShortenedUrl(data.result.full_short_link);
    } catch (e) {
      alert(e);
    }
  };
  const redirectToUrl = () => {
    if (shortendUrl) {
      window.open(shortendUrl, '_blank');
    }
  };
  
  return (
    <div className="app">
      <div className='shortener'>
        <h2>URL shortener</h2>
        <form onSubmit={shortenUrl}>
          <input
            placeholder='Enter URL'
            value={url}
            onChange={(e) => setUrl(e.target.value)}/>
          <button>Submit</button>
        </form>
        {shortendUrl &&
        <div>
        <p>Shortened URL:</p>
        <a href={shortendUrl} onClick={redirectToUrl}>
          {shortendUrl}
        </a>
      </div>
        }
      </div>
    </div>
  );
}

export default App;