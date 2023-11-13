import { useEffect, useState } from 'react';
import { block } from 'million/react';

const Coin = block(
  ({ image, name, price, volume, symbol, priceChange, marketcap }) => {
    return (
      <div
        className="coin-container"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <div
          className="coin-row"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'start',
            height: '80px',
            borderBottom: '1px solid #d7d7d7',
            width: '1000px',
          }}
        >
          <div
            className="coin"
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingRight: '24px',
              minWidth: '300px',
            }}
          >
            <img src={image} style={{height:"70px"}} alt="crypto" />
            <h3 style={{marginLeft:"70px"}}>{name}</h3>
          </div>
            <p className="coin-symbol" style={{ textTransform: 'uppercase' }}>
              {symbol}
            </p>
          <div
            className="coin-data"
            style={{
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <p className="coin-price" style={{ width: '110px' }}>
              ${price}
            </p>
            <p className="coin-volume" style={{ width: '155px' }}>
              ${volume.toLocaleString()}
            </p>
            {priceChange < 0 ? (
              <p className="coin-percent red" style={{width:"100px",color:"red"}}>{priceChange.toFixed(2)}%</p>
            ) : (
              <p className="coin-percent green" style={{width:"100px",color:"green"}}>{priceChange.toFixed(2)}%</p>
            )}
            <p className="coin-marketcap" style={{width:"230px"}}>
              MKT Cap: ${marketcap.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

function CryptoTracker() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
    )
      .then((res) => res.json())
      .then((data) => {
        setCoins(data);
        console.log(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="coin-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '72px',
        color: 'white',
      }}
    >
      <div
        className="coin-search"
        style={{
          marginBottom: '72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h1
          className="coin-text"
          style={{ marginBottom: '39px', textAlign: 'center' }}
        >
          Search a currency
        </h1>
        <form>
          <input
            type="text"
            className="coin-input"
            placeholder="Search . . ."
            onChange={handleChange}
            style={{
              paddingLeft: '16px',
              width: '500px',
              height: '40px',
              borderRadius: '2.5px',
              border: 'none',
              backgroundColor: '#f7f7ff',
              color: '#cc444b',
              fontWeight: '700',
              marginBottom: '20px',
            }}
          />
        </form>
      </div>
      {filteredCoins.map((coin) => {
        return (
          <Coin
            key={coin.id}
            name={coin.name}
            image={coin.image}
            symbol={coin.symbol}
            marketcap={coin.market_cap}
            price={coin.current_price}
            priceChange={coin.price_change_percentage_24h}
            volume={coin.total_volume}
          />
        );
      })}
    </div>
  );
}

export default CryptoTracker;
