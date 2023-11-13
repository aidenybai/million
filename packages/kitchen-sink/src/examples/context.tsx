import { useState, createContext, useContext } from 'react';
import { block } from 'million/react';

const ThemeContext = createContext('light');

const Context = block(({onClick}) => {
  const theme = useContext(ThemeContext);

  return (
    <button
      style={{
        color: theme === 'light' ? 'black' : 'white',
        backgroundColor: theme === 'light' ? 'white' : 'black',
      }}
      onClick={onClick}
    >
      {theme}
    </button>
  );
});

const App = block(() => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Context onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
    </ThemeContext.Provider>
  );
});

export default App;
