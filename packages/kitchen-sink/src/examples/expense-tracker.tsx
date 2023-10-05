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

const ExpenseTracker = block(() => {
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

  useEffect(() => {
    calculateExpenses();
  }, [transactions]);

  const handleOnSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formEntry: Transaction | {} = { id: genUUID() };
    for (let [key, value] of formData.entries()) {
      if (key === 'isExpense') {
        let type = value === 'expense' ? true : false;
        formEntry = { ...formEntry, [key]: type };
      } else {
        formEntry = { ...formEntry, [key]: value };
      }
    }
    setTransactions(transactions.concat(formEntry));
    inputRef.current?.focus();
  };

  return (
    <section>
      <h1 style={{ textAlign: 'center' }}> Expense Tracker</h1>
      <div
        style={{
          display: 'flex',
          placeContent: 'space-between',
        }}
      >
        <p>
          Income: <span style={{ color: 'green' }}>${wallet.incomes}</span>
        </p>
        <p>
          Expenses: <span style={{ color: 'red' }}>${wallet.expenses}</span>
        </p>
      </div>
      <h2 style={{ textAlign: 'right' }}>
        Balance :<span style={{ color: 'forestgreen' }}>${wallet.balance}</span>
      </h2>
      <div>
        <InputForm handleOnSubmit={handleOnSubmit} inputRef={inputRef} />
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
});

type InputFormProps = {
  handleOnSubmit: React.FormEventHandler;
  inputRef: React.ForwardedRef<HTMLInputElement>;
};

const InputForm = ({ handleOnSubmit, inputRef }: InputFormProps) => {
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
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
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
              name="isExpense"
              value="expense"
              id="expense"
              defaultChecked
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
            <input type="radio" name="isExpense" id="income" value="income" />
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

const ExpenseItem = block(({ title, amount, isExpense }: Transaction) => {
  return (
    <li>
      {title} {`${isExpense ? '-' : '+'}`}{' '}
      <span style={isExpense ? { color: 'red' } : { color: 'green' }}>
        ${amount}
      </span>
    </li>
  );
});

export default ExpenseTracker;
