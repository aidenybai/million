import React, { useState } from "react";
import { block } from 'million/react';

interface TemperatureConverterState {
inputUnit: TemperatureUnit;
outputUnit: TemperatureUnit;
temperature: number;
convertedTemperature: number;
}

enum TemperatureUnit {
Celsius = "Celsius",
Fahrenheit = "Fahrenheit",
Kelvin = "Kelvin",
}

const TemperatureConverter: React.FC = block(() => {
const [state, setState] = useState<TemperatureConverterState>({
    inputUnit: TemperatureUnit.Celsius,
    outputUnit: TemperatureUnit.Fahrenheit,
    temperature: 0,
    convertedTemperature: 0,
});

const convertTemperature = () => {
    const convertedTemperature = convert(
    state.inputUnit,
    state.outputUnit,
    state.temperature
    );
    setState({ ...state, convertedTemperature });
};

const handleInputUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, inputUnit: event.target.value  as TemperatureUnit});
};

const handleOutputUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, outputUnit: event.target.value  as TemperatureUnit});
};

const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, temperature: Number(event.target.value) });
};

return (
    <div className="Temperature Converter" 
    style={{
        textAlign: 'center',
    }}>
    <h1>Temperature Converter</h1>
    <div>
    <input
        style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
        }}
        type="number"
        value={state.temperature}
        onChange={handleTemperatureChange}
        />
        <select
        style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
            outline: 'none',
        }}
        value={state.inputUnit}
        onChange={handleInputUnitChange}
        >
        <option value={TemperatureUnit.Celsius}>Celsius</option>
        <option value={TemperatureUnit.Fahrenheit}>Fahrenheit</option>
        <option value={TemperatureUnit.Kelvin}>Kelvin</option>
        </select>
    </div>
    <div>
        <input 
        style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
        }}
        type="number" value={state.convertedTemperature} disabled />
        <select
        style={{
            borderRadius: '10px',
            padding: '10px 10px',
            margin: '5px 5px',
            outline: 'none',
        }}
        value={state.outputUnit}
        onChange={handleOutputUnitChange}
        >
        <option value={TemperatureUnit.Celsius}>Celsius</option>
        <option value={TemperatureUnit.Fahrenheit}>Fahrenheit</option>
        <option value={TemperatureUnit.Kelvin}>Kelvin</option>
        </select>
    </div>
    <button 
    style={{
        marginTop:"10px",
        padding: "10px 15px",
        color: "#fff",
        backgroundColor: "#007bff",
        borderColor: "#007bff",
        borderRadius: "0.25rem",
        transition: "color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out"
    }}
    onClick={convertTemperature}>Convert</button>
    </div>
);
});

const convert = (
inputUnit: TemperatureUnit,
outputUnit: TemperatureUnit,
temperature: number
): number => {
switch (inputUnit) {
    case TemperatureUnit.Celsius:
    if (outputUnit === TemperatureUnit.Fahrenheit) {
        return temperature * 1.8 + 32;
    } else if (outputUnit === TemperatureUnit.Kelvin) {
        return temperature + 273.15;
    }
    case TemperatureUnit.Fahrenheit:
    if (outputUnit === TemperatureUnit.Celsius) {
        return (temperature - 32) / 1.8;
    } else if (outputUnit === TemperatureUnit.Kelvin) {
        return (temperature + 459.67) * 5 / 9;
    }
    case TemperatureUnit.Kelvin:
    if (outputUnit === TemperatureUnit.Celsius) {
        return temperature - 273.15;
    } else if (outputUnit === TemperatureUnit.Fahrenheit) {
        return (temperature * 9 / 5) - 459.67;
    }
}

throw new Error("Invalid temperature unit.");
};

export default TemperatureConverter;
