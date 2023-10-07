import React, { useState } from 'react';
import { block } from 'million/react';

const QuoteGenerator: React.FC = block(() => {
  const [quote, setQuote] = useState<string>('');

  const fetchNewQuote = () => {
    fetch('https://api.quotable.io/random')
      .then((response) => response.json())
      .then((data) => {
        if (data.content) {
          setQuote(data.content);
        }
      })
      .catch((error) => console.error('Error fetching quotes:', error));
  };

  return (
    <div>
      <h1>Inspirational Quote Generator</h1>
      <button onClick={fetchNewQuote}>Get New Quote</button>
      <p>{quote}</p>
    </div>
  );
});

export default QuoteGenerator;
