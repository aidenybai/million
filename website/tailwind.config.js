const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  content: [
    './components/**/*.js',
    './pages/**/*.mdx',
    './theme.config.js',
    './styles.css',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'gradient-x': 'gradient-x 10s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '100% 100%',
            'background-position': 'bottom',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'top',
          },
        },
      },
      fontFamily: {
        sans: [`"Inter"`, 'sans-serif'],
        mono: [
          'Menlo',
          'Monaco',
          'Lucida Console',
          'Liberation Mono',
          'DejaVu Sans Mono',
          'Bitstream Vera Sans Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        dark: '#000',
        gray: colors.neutral,
        blue: colors.blue,
        orange: colors.orange,
        green: colors.green,
        red: colors.red,
        yellow: colors.yellow,
        color0: '#ffcfc3',
        color1: '#ED9CA2',
        color2: '#A96FDC',
        night1: '#1f1738',
        night2: '#6128a4',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        betterhover: { raw: '(hover: hover)' },
      },
    },
  },
  darkMode: 'class',
};
