import { useState } from 'react';
import { block } from 'million/react';

interface Results {
  totalInvestment: number;
  totalPayment: number;
  totalInterest: number;
}

const InvestmentCalculator = block(() => {
  const [investmentAmount, setInvestmentAmount] = useState<number | string>('');
  const [interestRate, setInterestRate] = useState<number | string>('');
  const [numberOfYears, setNumberOfYears] = useState<number | string>('');
  const [results, setResults] = useState<Results | null>(null);

  const calculateInterest = () => {
    const p = parseFloat(investmentAmount as string);
    const r = parseFloat(interestRate as string);
    const n = parseInt(numberOfYears as string, 10);

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const totalInterest = (p * r * n) / 100;
    const totalPayment = totalInterest + p;
    const totalInvestment = p;

    setResults({
      totalInvestment,
      totalPayment,
      totalInterest,
    });
  };

  return (
    <div className="InvestmentCalculator">
      <h1>Investment Calculator</h1>
      <div>
        <label>Total Investment ($): </label>
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <div>
        <label>Interest Rate (Annual %): </label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <div>
        <label>Duration (Years): </label>
        <input
          type="number"
          value={numberOfYears}
          onChange={(e) => setNumberOfYears(e.target.value)}
          style={{ display: 'block', marginBottom: '15px' }}
        />
      </div>
      <button onClick={calculateInterest}>Calculate</button>

      {results && (
        <div className="results">
          <h2>Results:</h2>
          <div>End Balance: ${results.totalPayment.toFixed(2)}</div>
          <div>Total Investment : ${results.totalInvestment.toFixed(2)}</div>
          <div>Total Interest: ${results.totalInterest.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
});

export default InvestmentCalculator;
