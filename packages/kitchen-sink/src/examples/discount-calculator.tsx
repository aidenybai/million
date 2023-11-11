import { useState } from 'react';
import { block } from 'million/react';

interface Results {
  discountPrice: number;
  finalPrice: number;
}

const DiscountCalculator = block(() => {
  const [originalPrice, setOriginalPrice] = useState<number | string>('');
  const [discountRate, setDiscountRate] = useState<number | string>('');
  const [results, setResults] = useState<Results | null>(null);

  const calculateDiscount = () => {
    const p = parseFloat(originalPrice as string);
    const r = parseFloat(discountRate as string) / 100;

    if (isNaN(p) || isNaN(r) || p <= 0 || r <= 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const discountPrice = p * r;
    const finalPrice = p - discountPrice;

    setResults({
      discountPrice,
      finalPrice,
    });
  };

  return (
    <div className="Discount Calculator">
      <h2>Discount Calculator</h2>
      <div style={{ display: 'block', marginBottom: '10px' }}>
        <label>Original Price ($): </label>
        <input
          type="number"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          style={{ display: 'block' }}
        />
      </div>
      <div style={{ display: 'block', marginBottom: '20px' }}>
        <label>Discount (% off): </label>
        <input
          type="number"
          value={discountRate}
          onChange={(e) => setDiscountRate(e.target.value)}
          style={{ display: 'block' }}
        />
      </div>
      <button onClick={calculateDiscount}>Calculate</button>

      {results && (
        <div className="results" style={{ marginTop: '20px' }}>
          <h2>Results:</h2>
          <div>Final Price : ${results.finalPrice.toFixed(2)}</div>
          <div>You Save : ${results.discountPrice.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
});

export default DiscountCalculator;
