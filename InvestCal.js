<!DOCTYPE html>
<html>
<head>
    <title>Investment Calculator</title>
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
        <h1>Investment Calculator</h1>

        <div class="input-group">
            <label for="principal">Principal Amount: $</label>
            <input type="number" id="principal" placeholder="Enter the principal amount">
        </div>

        <div class="input-group">
            <label for="annualRate">Annual Interest Rate (%):</label>
            <input type="number" id="annualRate" placeholder="Enter the annual interest rate">
        </div>

        <div class="input-group">
            <label for="duration">Investment Duration (years):</label>
            <input type="number" id="duration" placeholder="Enter the investment duration">
        </div>

        <div class="input-group">
            <button onclick="calculateInvestment()">Calculate</button>
        </div>

        <div class="input-group">
            <p>Total Amount After Duration: $<span id="totalAmount">0</span></p>
        </div>

        <script>
            function calculateInvestment() {
                const principal = parseFloat(document.getElementById("principal").value);
                const annualRate = parseFloat(document.getElementById("annualRate").value);
                const duration = parseInt(document.getElementById("duration").value);

                if (isNaN(principal) || isNaN(annualRate) || isNaN(duration)) {
                    alert("Please enter valid numbers for all fields.");
                    return;
                }

                const interest = (principal * annualRate / 100) * duration;
                const totalAmount = principal + interest;

                document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
            }
        </script>
    </div>
</body>
</html>
