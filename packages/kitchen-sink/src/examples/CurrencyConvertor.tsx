// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import CurrencyInput from './CurrencyInput';
// import {FC} from "react";
// interface CurrencyInputProps {
//   amount: number;
//   currency: string;
//   currencies?: string[];
//   onAmountChange?: (amount: number) => void;
//   onCurrencyChange?: (currency: string) => void;
// }

// // Example "USD"=5.0
// interface RateData {
//   [key: string]: number;
// }

// interface AppState {
//   amount1: number;
//   setAmount1: Function;
//   amount2: number;
//   setAmount2: Function;
//   currency1: string;
//   setCurrency1: Function;
//   currency2: string;
//   setCurrency2: Function;
//   rates: RateData;
// }

// function App() {
//   const [amount1, setAmount1] = useState<number>(0);
//   const [amount2, setAmount2] = useState<number>(0);
//   const [currency1, setCurrency1] = useState<string>("");
//   const [currency2, setCurrency2] = useState<string>("");
//   const [rates, setRates] = useState<object>({});

//   useEffect(() => {
//     axios
//       .get(
//         'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_KIOdLCl5FwF3DTpBG88AhKxYroTciaNco2x1arQY,
//       )
//       .then((response) => {
//         setRates(response.data);
//       });
//   }, []);

//   useEffect(() => {
//     if (rates && Object.keys(rates).length > 0) {
//       handleAmount1Change(1);
//     }
//   }, [rates]);

//   function format(number: number) {
//     // return number.toFixed    if (rates) {
//     //     const newAmount2 = format((amount1 * rates[currency2]) / rates[currency1]);
//     //     setAmount2(newAmount2);
//     //   }(4);
//   }

//   function handleAmount1Change(amount1: number) {
//     setAmount2(format(amount1 * rates[currency2] / rates[currency1]));
//     setAmount1(amount1);
//   }

//   function handleCurrency1Change(currency1: string) {
//     setAmount2(format(amount1 * rates[currency2] / rates[currency1]));
//     setCurrency1(currency1);

//   }

//   function handleAmount2Change(amount2: number) {
//     setAmount1(format(amount2 * rates[currency1] / rates[currency2]));
//     setAmount2(amount2);
//   }

//   function handleCurrency2Change(currency2: string) {
//     setAmount1(format(amount2 * rates[currency1] / rates[currency2]));
//     setCurrency2(currency2);
//   }

//   return (
//     <div>
//       <h1>Currency Converter</h1>
//       <CurrencyInput
//         onAmountChange={handleAmount1Change}
//         onCurrencyChange={handleCurrency1Change}
//         currencies={Object.keys(rates)}
//         amount={amount1}
//         currency={currency1}
//       />
//       <CurrencyInput
//         onAmountChange={handleAmount2Change}
//         onCurrencyChange={handleCurrency2Change}
//         currencies={Object.keys(rates)}
//         amount={amount2}
//         currency={currency2}
//       />
//     </div>
//   );
// }

// export default App
import { block } from 'million/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
interface RatesData {
  [currency: string]: number;
}
interface CurrencyInputProps {
  amount: number;
  currency: string;
  currencies?: string[];
  onAmountChange?: (amount: number) => void;
  onCurrencyChange?: (currency: string) => void;
}
function CurrencyConvertor() {
  const [amount1, setAmount1] = useState<number>(1);
  const [amount2, setAmount2] = useState<number>(1);
  const [currency1, setCurrency1] = useState<string>('USD');
  const [currency2, setCurrency2] = useState<string>('EUR');
  const [rates, setRates] = useState<RatesData>({});

  useEffect(() => {
    axios
      .get(
        'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_KIOdLCl5FwF3DTpBG88AhKxYroTciaNco2x1arQY',
      )
      .then((response) => {
        setRates(response.data.data);
      });
  }, []);

  useEffect(() => {
    if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
      handleAmount1Change(1);
    }
  }, [rates]);

  function format(number: number): string {
    return number.toFixed(4);
  }

  function handleAmount1Change(amount1: number) {
    setAmount2(
      parseFloat(format((amount1 * rates[currency2]) / rates[currency1])),
    );
    setAmount1(amount1);
  }

  function handleCurrency1Change(currency1: string) {
    setAmount2(
      parseFloat(format((amount1 * rates[currency2]) / rates[currency1])),
    );
    setCurrency1(currency1);
  }

  function handleAmount2Change(amount2: number) {
    setAmount1(
      parseFloat(format((amount2 * rates[currency1]) / rates[currency2])),
    );
    setAmount2(amount2);
  }

  function handleCurrency2Change(currency2: string) {
    setAmount1(
      parseFloat(format((amount2 * rates[currency1]) / rates[currency2])),
    );
    setCurrency2(currency2);
  }

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <h1>Currency Converter</h1>
      <CurrencyInput
        onAmountChange={handleAmount1Change}
        onCurrencyChange={handleCurrency1Change}
        currencies={Object.keys(rates)}
        amount={amount1}
        currency={currency1}
      />
      <CurrencyInput
        onAmountChange={handleAmount2Change}
        onCurrencyChange={handleCurrency2Change}
        currencies={Object.keys(rates)}
        amount={amount2}
        currency={currency2}
      />
    </div>
  );
}

export default CurrencyConvertor;

const CurrencyInput = block((props: CurrencyInputProps) => {
  //   const handleAmountChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
  //     const newValue = parseFloat(ev.target.value); // Convert to number
  //     props.onAmountChange?.(newValue);
  //   };

  return (
    <div>
      <input
        style={{
          borderRadius: '10px',
          padding: '10px 10px',
          margin: '5px 5px',
        }}
        type="text"
        value={props.amount}
        onChange={(ev) => props.onAmountChange?.(parseFloat(ev.target.value))}
      />
      <select
        style={{
          borderRadius: '10px',
          padding: '10px 10px',
          margin: '5px 5px',
          outline:"none"
        }}
        value={props.currency}
        onChange={(ev) => props.onCurrencyChange?.(ev.target.value)}
      >
        {props.currencies?.map((currency) => (
          <option style={{
            borderRadius:"100px",
            fontSize:"16px",
          }}  key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
});
