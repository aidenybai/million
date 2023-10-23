<!DOCTYPE html>
<html>
<head>
    <title>Data Converter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
        }
        .input-group {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Data Converter</h1>

        <div class="input-group">
            <label for="dataValue">Enter Data Value: </label>
            <input type="number" id="dataValue" placeholder="Enter a value">
        </div>

        <div class="input-group">
            <label>Select Conversion Type:</label><br>
            <input type="radio" id="toKilograms" name="conversionType" value="toKilograms">
            <label for="toKilograms">Pounds to Kilograms</label><br>

            <input type="radio" id="toPounds" name="conversionType" value="toPounds">
            <label for="toPounds">Kilograms to Pounds</label><br>

            <input type="radio" id="toMeters" name="conversionType" value="toMeters">
            <label for="toMeters">Feet to Meters</label><br>

            <input type="radio" id="toFeet" name="conversionType" value="toFeet">
            <label for="toFeet">Meters to Feet</label><br>

            <input type="radio" id="toCelsius" name="conversionType" value="toCelsius">
            <label for="toCelsius">Fahrenheit to Celsius</label><br>

            <input type="radio" id="toFahrenheit" name="conversionType" value="toFahrenheit">
            <label for="toFahrenheit">Celsius to Fahrenheit</label><br>

            <input type="radio" id="toUSD" name="conversionType" value="toUSD">
            <label for="toUSD">EUR to USD</label><br>

            <input type="radio" id="toEUR" name="conversionType" value="toEUR">
            <label for="toEUR">USD to EUR</label><br>
        </div>

        <div class="input-group">
            <button onclick="convertData()">Convert</button>
        </div>

        <div class="input-group">
            <p id="result"></p>
        </div>

        <script>
            function convertData() {
                const dataValue = parseFloat(document.getElementById("dataValue").value);
                const conversionType = document.querySelector('input[name="conversionType"]:checked').value;
                let result = 0;

                if (isNaN(dataValue)) {
                    document.getElementById("result").innerText = "Please enter a valid number.";
                    return;
                }

                switch (conversionType) {
                    case "toKilograms":
                        result = dataValue * 0.453592;
                        document.getElementById("result").innerText = `${dataValue} pounds is approximately ${result.toFixed(2)} kilograms.`;
                        break;
                    case "toPounds":
                        result = dataValue * 2.20462;
                        document.getElementById("result").innerText = `${dataValue} kilograms is approximately ${result.toFixed(2)} pounds.`;
                        break;
                    case "toMeters":
                        result = dataValue * 0.3048;
                        document.getElementById("result").innerText = `${dataValue} feet is approximately ${result.toFixed(2)} meters.`;
                        break;
                    case "toFeet":
                        result = dataValue * 3.28084;
                        document.getElementById("result").innerText = `${dataValue} meters is approximately ${result.toFixed(2)} feet.`;
                        break;
                    case "toCelsius":
                        result = (dataValue - 32) * 5/9;
                        document.getElementById("result").innerText = `${dataValue} Fahrenheit is approximately ${result.toFixed(2)} Celsius.`;
                        break;
                    case "toFahrenheit":
                        result = (dataValue * 9/5) + 32;
                        document.getElementById("result").innerText = `${dataValue} Celsius is approximately ${result.toFixed(2)} Fahrenheit.`;
                        break;
                    case "toUSD":
                        result = dataValue * 1.18; // Sample conversion rate
                        document.getElementById("result").innerText = `${dataValue} EUR is approximately ${result.toFixed(2)} USD.`;
                        break;
                    case "toEUR":
                        result = dataValue / 1.18; // Sample conversion rate
                        document.getElementById("result").innerText = `${dataValue} USD is approximately ${result.toFixed(2)} EUR.`;
                        break;
                    default:
                        document.getElementById("result").innerText = "Please select a conversion type.";
                }
            }
        </script>
    </div>
</body>
</html>
