import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
// @ts-ignore
import Inspect from 'vite-plugin-inspect';
import million from '../compiler';

import data from '../../package.json';

// https://vitejs.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [million.vite({ mute: 'info', auto: true }), react(), Inspect()],
  resolve: {
    alias: {
      'million/react': path.resolve(__dirname, '../react'),
      'million/experimental': path.resolve(__dirname, '../experimental'),
      'million/react-server': path.resolve(__dirname, '../react-server'),
    },
  },
  define: {
    'process.env.VERSION': JSON.stringify(data.version),
  },
});
