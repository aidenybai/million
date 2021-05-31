import { resolve } from 'path';

export default {
  root: 'dev',
  resolve: {
    alias: {
      million: resolve(__dirname, 'src/index.ts'),
    },
  },
};
