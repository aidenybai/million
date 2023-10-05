import React, { useState } from 'react';
import axios from 'axios';

const StockPriceTracker = () => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  const fetchStockPrice = async () => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`
      );
      const data = response.data['Global Quote'];
      const stockPrice = parseFloat(data['05. price']);
      setPrice(stockPrice);
      setError(null);
    } catch (error) {
      setPrice(null);
      setError('Error fetching stock price. Please try again.');
    }
  };

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchStockPrice();
  };  

  return (
    <div>
      <h2>Stock Price Tracker</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Stock Symbol:
          <input type="text" value={symbol} onChange={handleSymbolChange} />
        </label>
        <button type="submit">Track</button>
      </form>
      {price && <p>Current Price: ${price}</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default StockPriceTracker;
