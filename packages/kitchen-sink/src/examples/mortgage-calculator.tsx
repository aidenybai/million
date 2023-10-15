import { useState } from 'react';
import { block } from 'million/react';

interface Results {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

const MortgageCalculator = block(() => {
  const [principal, setPrincipal] = useState<number | string>('');
  const [rate, setRate] = useState<number | string>('');
  const [years, setYears] = useState<number | string>('');
  const [results, setResults] = useState<Results | null>(null);

  const calculateMortgage = () => {
    const p = parseFloat(principal as string);
    const r = parseFloat(rate as string) / 12 / 100;
    const n = parseInt(years as string, 10) * 12;

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const monthlyPayment =
      (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
    });
  };

  return (
    <div className="MortgageCalculator">
      <h1>Mortgage Calculator</h1>
      <div>
        <label>Principal Amount ($): </label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <div>
        <label>Rate (Annual %): </label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <div>
        <label>Term (Years): </label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <button onClick={calculateMortgage}>Calculate</button>

      {results && (
        <div className="results">
          <h2>Results:</h2>
          <div>Monthly Payment: ${results.monthlyPayment.toFixed(2)}</div>
          <div>Total Payment: ${results.totalPayment.toFixed(2)}</div>
          <div>Total Interest: ${results.totalInterest.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
});

export default MortgageCalculator;
