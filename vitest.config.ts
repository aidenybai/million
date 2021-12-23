// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    watch: false,
    environment: 'jsdom',
  },
});
