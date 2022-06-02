import * as React from './react';
import * as ReactDOM from './react-dom';

export * from './react';
export * from './react-dom';
export const version = '18.1.0';
export default {
  version,
  ...React,
  ...ReactDOM,
};
