import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { block } from 'million/react';

const StockPriceTracker = block(() => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState(null);
  const [companyOverview, setCompanyOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockPrice = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`
        );
        const data = response.data['Global Quote'];
        const currentPrice = data['05. price'];
        setPrice(currentPrice);
      } catch (error) {
        setPrice(null);
        setError('Error fetching stock price. Please try again.');
      }
    };

    const fetchCompanyOverview = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=YOUR_API_KEY`
        );
        const data = response.data;
        setCompanyOverview(data);
      } catch (error) {
        setCompanyOverview(null);
        setError('Error fetching company overview. Please try again.');
      }
    };

    if (symbol) {
      fetchStockPrice();
      fetchCompanyOverview();
    }
  }, [symbol]);

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPrice(null);
    setCompanyOverview(null);
    setError(null);
  };

  return (
    <div>
      <h2>Stock Price Tracker</h2>
      <p>Enter a valid stock symbol to track its price and view company overview.</p>
      <h3>Example</h3>
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Corresponding Ticker</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Apple</td>
            <td>AAPL</td>
          </tr>
          <tr>
            <td>Microsoft</td>
            <td>MSFT</td>
          </tr>
          <tr>
            <td>Google</td>
            <td>GOOGL</td>
          </tr>
          <tr>
            <td>Tesla</td>
            <td>TSLA</td>
          </tr>
        </tbody>
      </table>
      <br></br>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Stock Symbol:
          <input type="text" value={symbol} onChange={handleSymbolChange} />
        </label>
        <button type="submit">Track</button>
      </form>
      {price && (
        <div>
          <h3>Current Price:</h3>
          <p>{price}</p>
        </div>
      )}
      {companyOverview && (
        <div>
          <h3>Company Overview:</h3>
          <p>Symbol: {companyOverview.Symbol}</p>
          <p>Name: {companyOverview.Name}</p>
          <p>Sector: {companyOverview.Sector}</p>
          <p>Industry: {companyOverview.Industry}</p>
          <p>Market Capitalization: {companyOverview.MarketCapitalization}</p>
          <p>Description: {companyOverview.Description}</p>
          <p>DividendPerShare: {companyOverview.DividendPerShare}</p>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
});

export default StockPriceTracker;
