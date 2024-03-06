import React, { useState } from 'react';
import { block } from 'million/react';

interface DataConverterState {
  inputUnit: DataUnit;
  outputUnit: DataUnit;
  value: number;
  convertedValue: number;
}

enum DataUnit {
  Byte = 'Byte',
  Kilobyte = 'KB',
  Megabyte = 'MB',
  Gigabyte = 'GB',
  Terabyte = 'TB',
  Petabyte = 'PB',
}

const DataConverter: React.FC = block(() => {
  const [state, setState] = useState<DataConverterState>({
    inputUnit: DataUnit.Byte,
    outputUnit: DataUnit.Kilobyte,
    value: 0,
    convertedValue: 0,
  });

  const convertData = () => {
    const convertedValue = convert(
      state.inputUnit,
      state.outputUnit,
      state.value,
    );
    setState({ ...state, convertedValue });
  };

  const handleInputUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setState({ ...state, inputUnit: event.target.value as DataUnit });
  };

  const handleOutputUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setState({ ...state, outputUnit: event.target.value as DataUnit });
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, value: Number(event.target.value) });
  };

  return (
    <main
      style={{
        textAlign: 'center',
      }}
      className="Data Converter"
    >
      <h2>Data Converter</h2>
      <div>
        <input
          style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
            height: '40px',
          }}
          type="number"
          value={state.value}
          onChange={handleValueChange}
          min={0}
        />
        <select
          style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
            outline: 'none',
            color: 'currentcolor',
            backgroundColor: ' var(--background)',
            border: 'none',
            height: '40px',
          }}
          value={state.inputUnit}
          onChange={handleInputUnitChange}
        >
          <option value={DataUnit.Byte}>Byte B</option>
          <option value={DataUnit.Kilobyte}>Kilobyte KB</option>
          <option value={DataUnit.Megabyte}>Megabyte MB</option>
          <option value={DataUnit.Gigabyte}>Gigabyte GB</option>
          <option value={DataUnit.Terabyte}>Terabyte TB</option>
          <option value={DataUnit.Petabyte}>Petabyte PB</option>
        </select>
      </div>
      <div>
        <input
          style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
            height: '40px',
            cursor: 'not-allowed',
          }}
          type="number"
          value={state.convertedValue}
          disabled
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
            border: 'none',
          }}
          value={state.outputUnit}
          onChange={handleOutputUnitChange}
        >
          <option value={DataUnit.Byte}>Byte B</option>
          <option value={DataUnit.Kilobyte}>Kilobyte KB</option>
          <option value={DataUnit.Megabyte}>Megabyte MB</option>
          <option value={DataUnit.Gigabyte}>Gigabyte GB</option>
          <option value={DataUnit.Terabyte}>Terabyte TB</option>
          <option value={DataUnit.Petabyte}>Petabyte PB</option>
        </select>
      </div>
      <button
        style={{
          marginTop: '10px',
          padding: '10px 15px',
          color: '#fff',
          backgroundColor: '#007bff',
          borderColor: '#007bff',
          borderRadius: '0.25rem',
          transition:
            'color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out',
        }}
        onClick={convertData}
      >
        Convert
      </button>
    </main>
  );
});

const convert = (
  inputUnit: DataUnit,
  outputUnit: DataUnit,
  value: number,
): number => {
  const conversionFactor = {
    [DataUnit.Byte]: 1,
    [DataUnit.Kilobyte]: 1024,
    [DataUnit.Megabyte]: 1048576,
    [DataUnit.Gigabyte]: 1073741824,
    [DataUnit.Terabyte]: 1099511627776,
    [DataUnit.Petabyte]: 1125899906842624,
  };

  const inputUnitFactor = conversionFactor[inputUnit];
  const outputUnitFactor = conversionFactor[outputUnit];

  return (value * inputUnitFactor) / outputUnitFactor;
};

export default DataConverter;
