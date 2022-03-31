import { plugin } from './plugin';

export const seed = Math.floor(Math.random() * 1e5);
export const jsxFactory = `__MILLION_JSX_${seed}`;
export * from './compile';
export default plugin;
