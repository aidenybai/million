import React, {useState, useEffect} from 'react';
import { block } from 'million/react';
const Coin = block(({name, Image, symbol,price,volume,priceChange,marketCap}) => {
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
        <div style={{display:"flex",flexDirection:"row",borderBottom:"2px solid grey"}}>
            <div style={{display:"flex",flexDirection:"row",color:"rgb(213, 207, 207)"}}>
                <img src={Image} alt="" />
                <h1>{name}</h1>
                <p style={{width:"110px",textTransform:"uppercase"}}>{symbol}</p>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",textAlign:"center",width:"100%",color:"rgb(213, 207, 207)"}}>
                <p style={{width:"100px"}}>${price}</p>
                <p style={{width:"230px"}}>${volume.toLocaleString()}</p>
                {priceChange < 0 ? (
                    <p style={{width:"100px",color:"red"}}>{priceChange.toFixed(2)}%</p>
                ): (
                    <p style={{width:"100px",color:"green"}}>{priceChange.toFixed(2)}%</p> 
                )
                }
                <p style={{width:"150px"}}>
                    Mkt Cap: ${marketCap.toLocaleString()}
                </p>
            </div>
        </div>
    </div>
  )
})
function App() {
  const [coins, setCoins]=useState([])
  const [search,setSearch]=useState('')
  const fetchData = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`,{mode:'cors'}
    );
    const data=await response.json();
    setCoins(data);
    console.log(data);
  //   console.log(data.weather[0].main);
  };
  const handleChange= e =>{
    setSearch(e.target.value)
  }
  const filteredCoins = coins.filter((coin) =>
    {coin.name.toLowerCase().includes(search.toLowerCase())}
    )
  return (
    <div className="coin-app">
      <div className="coin-search">
        <h1 className="coin-text">Search Coin</h1>
        <form onSubmit={async(e)=>{await fetchData(e)}}>
          <input type="text" placeholder='Search Crypto' className='coin-input' onChange={handleChange}/>
          <button type="submit">Click Here</button>
        </form>
      </div>
      {filteredCoins.map(coin=>{
        return(
          <Coin  
          key={coin.id} 
          name={coin.name} 
          Image={coin.image} 
          symbol={coin.symbol} 
          price={coin.current_price} 
          volume={coin.total_volume} 
          priceChange={coin.market_cap_change_percentage_24h}
          marketCap={coin.market_cap}
          />
        ) 
        
      })}
    </div>
  );
}

export default App;
