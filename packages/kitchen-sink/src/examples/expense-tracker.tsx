import { useState, useRef, useEffect } from 'react';
import { block, For } from 'million/react';

type Transaction = {
  id?: string;
  title: string;
  amount: number;
  isExpense: boolean;
};

type Wallet = {
  incomes: number;
  expenses: number;
  balance: number;
};

const ExpenseTracker = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: genUUID(), title: 'Ka-ching', amount: 6000, isExpense: false },
    { id: genUUID(), title: '3% Milk', amount: 20, isExpense: true },
    { id: genUUID(), title: 'Fat-free Hummus', amount: 60, isExpense: true },
    { id: genUUID(), title: 'Dog food', amount: 20, isExpense: true },
    { id: genUUID(), title: 'Cat food', amount: 20, isExpense: true },
    { id: genUUID(), title: 'Human food', amount: 80, isExpense: true },
  ]);
  const [wallet, setWallet] = useState<Wallet>({
    incomes: 0,
    expenses: 0,
    balance: 0,
  });
  const [formInputs, setFormInputs] = useState<Transaction>({
    title: '',
    amount: 0,
    isExpense: true,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  function calculateExpenses() {
    let allExpenses = transactions
      .filter((item) => item.isExpense === true)
      .reduce((accumulator, currentValue) => {
        return (accumulator += Number(currentValue.amount));
      }, 0);
    let allIncomes = transactions
      .filter((item) => item.isExpense === false)
      .reduce((accumulator, currentValue) => {
        return (accumulator += Number(currentValue.amount));
      }, 0);
    setWallet({
      expenses: allExpenses,
      balance: allIncomes - allExpenses,
      incomes: allIncomes,
    });
  }
  useEffect(() => {
    calculateExpenses();
  }, []);

  function genUUID() {
    return self.crypto.randomUUID();
  }

  function handleFormInputs(event: React.SyntheticEvent) {
    const { name, value, type, id } = event.target as HTMLInputElement;
    if (type !== 'radio') {
      setFormInputs((prevData) => {
        return {
          ...prevData,
          [name]: value,
        };
      });
    } else {
      let isExpense = id === 'expense' ? true : false;
      setFormInputs((prevData) => {
        return {
          ...prevData,
          isExpense,
        };
      });
    }
  }

  useEffect(() => {
    calculateExpenses();
  }, [transactions]);

  function handleOnSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (formInputs.title !== '' && formInputs.amount > 0) {
      setTransactions(transactions.concat({ id: genUUID(), ...formInputs }));
      setFormInputs({ title: '', amount: 0, isExpense: true });
      inputRef.current?.focus();
    }
  }

  return (
    <section>
      <h1 style={{textAlign:'center'}}> Expense Tracker</h1>
      <div
        style={{
          display: 'flex',
          placeContent: 'space-between'
        }}
      >
        <p>
          Income: <span style={{ color: 'green' }}>${wallet.incomes}</span>
        </p>
        <p>
          Expenses: <span style={{ color: 'red' }}>${wallet.expenses}</span>
        </p>
      </div>
      <h2 style={{textAlign:'right'}}>Balance :<span style={{color:'forestgreen',}}>${wallet.balance}</span></h2>
      <div>
        <InputForm
          formInputs={formInputs}
          handleFormInputs={handleFormInputs}
          handleOnSubmit={handleOnSubmit}
          inputRef={inputRef}
        />
      </div>
      <h3>History</h3>
      <div>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          <For each={transactions}>
            {({ id, title, amount, isExpense }) => (
              <ExpenseItem
                key={id}
                id={id}
                title={title}
                amount={amount}
                isExpense={isExpense}
              />
            )}
          </For>
        </ul>
      </div>
    </section>
  );
};

type InputFormProps = {
  formInputs: Transaction;
  handleFormInputs: (event: React.SyntheticEvent) => void;
  handleOnSubmit: (event: React.SyntheticEvent) => void;
  inputRef: React.ForwardedRef<HTMLInputElement>;
};

const InputForm = ({
  formInputs,
  handleFormInputs,
  handleOnSubmit,
  inputRef,
}: InputFormProps) => {
  return (
    <div>
      <h3>Add a new entry</h3>
      <form onSubmit={handleOnSubmit}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label htmlFor="expenseName">Title</label>
          <input
            type="text"
            name="title"
            id="expenseName"
            placeholder="Enter an expense"
            value={formInputs.title}
            onChange={handleFormInputs}
            ref={inputRef}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label htmlFor="expenseAmount">Amount</label>
          <input
            type="number"
            name="amount"
            id="expenseAmount"
            placeholder="0.0"
            value={formInputs.amount}
            onChange={handleFormInputs}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <input
              type="radio"
              name="wallet-type"
              id="expense"
              checked={formInputs.isExpense === true}
              onChange={handleFormInputs}
            />
            <label htmlFor="expense">Expense</label>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <input
              type="radio"
              name="wallet-type"
              id="income"
              checked={formInputs.isExpense !== true}
              onChange={handleFormInputs}
            />
            <label htmlFor="income">Income</label>
          </div>
        </div>
        <button style={{ marginTop: '1rem', paddingInline: '1.5rem' }}>
          Add
        </button>
      </form>
    </div>
  );
};

const ExpenseItem = block(({ title, amount, isExpense }) => {
  return (
    <li>{title} {`${isExpense ? '-' : '+'}`} <span style={isExpense ? {color:'red'}: {color:'green'}}>${amount}</span></li>
  );
});

export default ExpenseTracker;
