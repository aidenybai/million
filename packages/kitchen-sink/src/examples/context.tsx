import { useState, createContext, useContext } from 'react';
import { block } from 'million/react';
// import { experimental_options } from 'million/experimental'

// experimental_options.noSlot = true
const ThemeContext = createContext('light');

const Context = block(({ onClick }) => {
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
    <div>
      <ThemeContext.Provider value={theme}>
        <Context
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </ThemeContext.Provider>
    </div>
  );
});

export default App;
