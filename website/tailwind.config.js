/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx',
    './node_modules/markprompt/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        spin: 'spin calc(var(--speed) * 2) infinite linear',
        slide: 'slide var(--speed) ease-in-out infinite alternate',
      },
    },
    keyframes: {
      spin: {
        '0%': {
          rotate: '0deg',
        },
        '15%, 35%': {
          rotate: '90deg',
        },
        '65%, 85%': {
          rotate: '270deg',
        },
        '100%': {
          rotate: '360deg',
        },
      },
      slide: {
        to: {
          transform: 'translate(calc(100cqw - 100%), 0)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
  darkMode: 'class',
};
