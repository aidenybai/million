import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import million from '../compiler';
import Inspect from 'vite-plugin-inspect';

// https://vitejs.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [million.vite({ mute: 'info' }), react(), Inspect()],
  resolve: {
    alias: {
      'million/react': path.resolve(__dirname, '../react'),
      'million/react-server': path.resolve(__dirname, '../react-server'),
    },
  },
});
