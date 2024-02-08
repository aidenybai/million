// import { useState, createContext, useContext } from 'react';
// import { block } from 'million/react';

// const ThemeContext = createContext('light');

// const Context = block(({onClick}) => {
//   const theme = useContext(ThemeContext);

//   return (
//     <button
//       style={{
//         color: theme === 'light' ? 'black' : 'white',
//         backgroundColor: theme === 'light' ? 'white' : 'black',
//       }}
//       onClick={onClick}
//     >
//       {theme}
//     </button>
//   );
// });

// const App = block(() => {
//   const [theme, setTheme] = useState('light');

//   return (
//     <div>
//     <ThemeContext.Provider value={theme}>
//       <Context onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
//     </ThemeContext.Provider>
//   </div>
//   );
// });

// export default App;
import { compiledBlock as _compiledBlock } from "million/react";
import { useState, createContext, useContext } from 'react';
import { block } from 'million/react';
const ThemeContext = createContext('light');
const Context_1 = _compiledBlock(_props => <button style={_props.v0} onClick={_props.v1}>
      {_props.v2}
    </button>, {
  name: "Context_1",
  portals: ["v2"]
});
const Context = ({
  onClick
}) => {
  const theme = useContext(ThemeContext);
  return /*@million jsx-skip*/<Context_1 scoped v0={{
    color: theme === 'light' ? 'black' : 'white',
    backgroundColor: theme === 'light' ? 'white' : 'black'
  }} v1={onClick} v2={theme} _hmr="1707395050534" />;
};
const App_1 = _compiledBlock(_props2 => <div>
    {_props2.v0}
  </div>, {
  name: "App_1",
  portals: ["v0"]
});
const App = () => {
  const [theme, setTheme] = useState('light');
  return /*@million jsx-skip*/<App_1 v0={<ThemeContext.Provider value={theme}>
      <Context onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
    </ThemeContext.Provider>} _hmr="1707395050536" />;
};
export default App;
