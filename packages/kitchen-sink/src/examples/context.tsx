import { useState, createContext, useContext } from 'react';
import { block } from 'million/react';

const ThemeContext = createContext('light');

const Context = block(() => {
  const theme = useContext(ThemeContext);

  return (
    <div style={{ color: theme === 'light' ? 'black' : 'white' }}>{theme}</div>
  );
});

const App = block(() => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        <Context />
      </button>
    </ThemeContext.Provider>
  );
});

export default App;
