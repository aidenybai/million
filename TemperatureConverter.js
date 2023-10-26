<!DOCTYPE html>
<html>
<head>
    <title>Temperature Converter</title>
</head>
<body>
    <h1>Temperature Converter</h1>
    <form id="converter-form">
        <label for="temperature">Temperature:</label>
        <input type="number" id="temperature" required>
        
        <label for="unit">Unit:</label>
        <select id="unit">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
        </select>
        
        <label for="conversion">Convert to:</label>
        <select id="conversion">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
        </select>
        
        <button type="button" onclick="convertTemperature()">Convert</button>
    </form>

    <div id="result"></div>

    <script>
        function convertTemperature() {
            const temperatureInput = document.getElementById("temperature");
            const unitInput = document.getElementById("unit");
            const conversionInput = document.getElementById("conversion");
            const resultDiv = document.getElementById("result");

            const temperature = parseFloat(temperatureInput.value);
            const fromUnit = unitInput.value;
            const toUnit = conversionInput.value;

            if (fromUnit === toUnit) {
                resultDiv.innerText = "Please select different units for conversion.";
                return;
            }

            let convertedTemperature;
            if (fromUnit === "celsius" && toUnit === "fahrenheit") {
                convertedTemperature = (temperature * 9/5) + 32;
            } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
                convertedTemperature = (temperature - 32) * 5/9;
            }

            resultDiv.innerText = `Converted Temperature: ${convertedTemperature} ${toUnit}`;
        }
    </script>
</body>
</html>
