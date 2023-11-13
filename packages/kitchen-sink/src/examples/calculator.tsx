import { useState } from 'react';
import { block } from 'million/react';

type ICalculator = {
  value: number;
  newValue: number | null;
  operator: string;
};

type IControls = {
  value: number;
  setValue: Function;
  newValue: number | null;
  setNewValue: Function;
  operator: string;
  setOperator: Function;
};

function Calculator() {
  const [value, setValue] = useState<number>(0);
  const [newValue, setNewValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string>('');

  return (
    <>
      <Screen value={value} newValue={newValue} operator={operator} />
      <Controls
        value={value}
        setValue={setValue}
        newValue={newValue}
        setNewValue={setNewValue}
        operator={operator}
        setOperator={setOperator}
      />
    </>
  );
}

const Screen = block(({ value, newValue, operator }: ICalculator) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#eee',
        marginBottom: '20px',
        padding: '5px 10px 5px 10px',
        borderRadius: '7px',
      }}
    >
      <p
        style={{
          color: '#333',
          fontSize: '40px',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 500,
          textAlign: 'right',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 18,
          color: '#aaa',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 500,
          textAlign: 'right',
        }}
      >
        {value} {operator} {newValue}
      </p>
    </div>
  );
});

function Controls({
  value,
  setValue,
  newValue,
  setNewValue,
  operator,
  setOperator,
}: IControls) {
  const onNumberClick = (number: number) => {
    if (!operator) {
      setValue(value * 10 + number);
    } else {
      setNewValue((newValue || 0) * 10 + number); // Use 0 as initial value if newValue is null
    }
  };

  const onCalculate = (type: string) => {
    if (operator) {
      // Perform the previous calculation before setting the new operator
      let result = calculateResult(value, newValue, operator);
      setValue(result);
      setNewValue(null);
    }
    setOperator(type);
  };

  const onEqualClick = () => {
    if (operator) {
      let result = calculateResult(value, newValue, operator);
      setValue(result);
      setNewValue(null);
      setOperator('');
    }
  };

  const calculateResult = (
    firstNumber: number,
    secondNumber: number | null,
    oper: string,
  ) => {
    if (secondNumber === null) {
      return firstNumber;
    }
    switch (oper) {
      case 'add':
        return firstNumber + secondNumber;
      case 'subtract':
        return firstNumber - secondNumber;
      case 'multiply':
        return firstNumber * secondNumber;
      case 'divide':
        return firstNumber / secondNumber;
      default:
        return firstNumber;
    }
  };

  const onReset = () => {
    setValue(0);
    setNewValue(null);
    setOperator('');
  };

  const onPercentage = () => {
    setValue(value / 100);
  };

  const onNegative = () => {
    setValue(value * -1);
  };

  const onDelete = () => {
    if (!operator) {
      setValue(Math.floor(value / 10));
    } else {
      newValue !== null && setNewValue(Math.floor(newValue / 10));
    }
  };

  // Map the buttons to their respective actions
  const buttonMap = [
    { text: 'AC', action: () => onReset() },
    { text: 'DEL', action: () => onDelete() },
    { text: '%', action: () => onPercentage() },
    {
      text: '/',
      action: () => onCalculate('divide'),
      style: {
        background: 'rgb(255, 149, 42)',
        fontWeight: 500,
        fontSize: '1.5em',
      },
    },
    {
      text: '7',
      action: () => onNumberClick(7),
      style: { fontSize: '1.5em' },
    },
    {
      text: '8',
      action: () => onNumberClick(8),
      style: { fontSize: '1.5em' },
    },
    {
      text: '9',
      action: () => onNumberClick(9),
      style: { fontSize: '1.5em' },
    },
    {
      text: 'x',
      action: () => onCalculate('multiply'),
      style: {
        background: 'rgb(255, 149, 42)',
        fontWeight: 500,
        fontSize: '1.5em',
      },
    },
    {
      text: '4',
      action: () => onNumberClick(4),
      style: { fontSize: '1.5em' },
    },
    {
      text: '5',
      action: () => onNumberClick(5),
      style: { fontSize: '1.5em' },
    },
    {
      text: '6',
      action: () => onNumberClick(6),
      style: { fontSize: '1.5em' },
    },
    {
      text: '-',
      action: () => onCalculate('subtract'),
      style: {
        background: 'rgb(255, 149, 42)',
        fontWeight: 500,
        fontSize: '2em',
      },
    },
    {
      text: '1',
      action: () => onNumberClick(1),
      style: { fontSize: '1.5em' },
    },
    {
      text: '2',
      action: () => onNumberClick(2),
      style: { fontSize: '1.5em' },
    },
    {
      text: '3',
      action: () => onNumberClick(3),
      style: { fontSize: '1.5em' },
    },
    {
      text: '+',
      action: () => onCalculate('add'),
      style: {
        background: 'rgb(255, 149, 42)',
        fontWeight: 500,
        fontSize: '1.75em',
      },
    },
    {
      text: '0',
      action: () => onNumberClick(0),
      style: {
        gridColumn: 'span 2',
        fontSize: '1.5em',
      },
    },
    {
      text: '+/-',
      action: () => onNegative(),
      style: {
        fontSize: '1.5em',
      },
    },
    {
      text: '=',
      action: () => onEqualClick(),
      style: {
        background: 'rgb(255, 149, 42)',
        fontWeight: 500,
        fontSize: '1.75em',
      },
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'repeat(5, 1fr)',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}
    >
      {buttonMap.map((button: any, index: number) => (
        <button key={index} onClick={button.action} style={button.style}>
          {button.text as string}
        </button>
      ))}
    </div>
  );
}

export default Calculator;
