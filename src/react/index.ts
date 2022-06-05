import * as React from './react';
import * as ReactDOM from './react-dom';
import * as ReactCompat from './compat';

export * from './react';
export * from './react-dom';
export * from './compat';
export const version = '18.1.0';
export default {
  version,
  ...React,
  ...ReactDOM,
  ...ReactCompat,
};
