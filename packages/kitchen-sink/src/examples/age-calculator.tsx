import { useState } from 'react';
import { block } from 'million/react';

const AgeCalculator = block(() => {
  const Today = new Date();
  const currentYear = Today.getFullYear();
  const currentMonth = Today.getMonth();
  const currentDay = Today.getDate();

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const [calculatedYear, setCalculatedYear] = useState(0);
  const [calculatedMonth, setCalculatedMonth] = useState(0);
  const [calculatedDay, setCalculatedDay] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let years = currentYear - Number(birthYear);
    let months = currentMonth + 1 - Number(birthMonth);
    let days = currentDay - Number(birthDay);

    if (days < 0) {
      months -= 1;
      const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) {
      years = 0;
      months = 0;
      days = 0;
    }

    setCalculatedYear(years);
    setCalculatedMonth(months);
    setCalculatedDay(days);
  }

  return (
    <section>
      <form onSubmit={handleSubmit} className="calculator-form">
        <span className="calculator-form-input-wrapper">
          <label htmlFor="day">Birth Day</label>
          <input
            type="text"
            name="day"
            id="day"
            placeholder="DD"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            maxLength={2}
            pattern="(0?[1-9]|[12][0-9]|3[01])"
          />
        </span>

        <span className="calculator-form-input-wrapper">
          <label htmlFor="month">Birth Month</label>
          <input
            type="text"
            name="month"
            id="month"
            placeholder="MM"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            maxLength={2}
            pattern="(1[0-2]|0?[1-9])"
          />
        </span>

        <span className="calculator-form-input-wrapper">
          <label htmlFor="year">Birth Year</label>
          <input
            type="text"
            name="year"
            id="year"
            placeholder="YYYY"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            maxLength={4}
          />
        </span>

        <button>Calculate</button>
      </form>

      <section>
        <h2 className="age">
          {calculatedYear} {calculatedYear > 1 ? 'years' : 'year'}
        </h2>

        <h2 className="age">
          {calculatedMonth} {calculatedMonth > 1 ? 'months' : 'month'}
        </h2>

        <h2 className="age">
          {calculatedDay} {calculatedDay > 1 ? 'days' : 'day'}
        </h2>
      </section>
    </section>
  );
});

export default AgeCalculator;
