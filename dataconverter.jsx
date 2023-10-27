import React, { useState } from 'react';

function DataConverter() {
  const [dataValue, setDataValue] = useState('');
  const [conversionType, setConversionType] = useState(''); 
  const [result, setResult] = useState('');

  const handleConvert = () => {
    switch (conversionType) {
      case 'toUpper':
        setResult(dataValue.toUpperCase());
        break;
      case 'toLower':
        setResult(dataValue.toLowerCase());
        break;
      // Add more conversion cases as needed
      default:
        setResult('Invalid conversion type');
    }
  };

  return (
    <div>
      <h2>Data Converter</h2>
      <label>
        Enter Data Value:
        <input
          type="text"
          value={dataValue}
          onChange={(e) => setDataValue(e.target.value)}
        />
      </label>
      <label>
        Select Conversion Type:
        <select
          value={conversionType}
          onChange={(e) => setConversionType(e.target.value)}
        >
          <option value="">Select Conversion Type</option>
          <option value="toUpper">To Uppercase</option>
          <option value="toLower">To Lowercase</option>
          {/* Add more conversion options here */}
        </select>
      </label>
      <button onClick={handleConvert}>Convert</button>
      <div>
        <strong>Result:</strong> {result}
      </div>
    </div>
  );
}

export default DataConverter;
