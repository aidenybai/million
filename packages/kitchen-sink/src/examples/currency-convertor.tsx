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
  title: string;
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
      <h2 style={{ marginBottom: '10px' }}>Currency Converter</h2>

      <CurrencyInput
        title="1"
        onAmountChange={handleAmount1Change}
        onCurrencyChange={handleCurrency1Change}
        currencies={Object.keys(rates)}
        amount={amount1}
        currency={currency1}
      />

      <CurrencyInput
        title="2"
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
  return (
    <div>
      <p>
        Currency {props?.title}: {props.currency}
      </p>
      <input
        style={{
          borderRadius: '10px',
          padding: '10px 10px',
          margin: '5px 5px',
          outline: 'none',
          height: '40px',
          color: 'currentcolor',
          backgroundColor: ' var(--background)',
          border: 'none',
        }}
        type="number"
        value={props.amount}
        onChange={(ev) => props.onAmountChange?.(parseFloat(ev.target.value))}
      />
      <select
        style={{
          borderRadius: '10px',
          padding: '10px 10px',
          margin: '5px 5px',
          outline: 'none',
          height: '40px',
          color: 'currentcolor',
          backgroundColor: ' var(--background)',
          minWidth: '50px',
          border: 'none',
        }}
        value={props.currency}
        onChange={(ev) => props.onCurrencyChange?.(ev.target.value)}
      >
        {props.currencies?.map((currency) => (
          <option
            style={{
              borderRadius: '100px',
              fontSize: '16px',
            }}
            key={currency}
            value={currency}
          >
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
});
