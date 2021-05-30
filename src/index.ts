import { h } from './h';
import { diff } from './diff';
import { base64ToWASM, wasmPayload } from './wasm';
import { createElement } from './createElement';

const runWASM = async (): Promise<void> => {
  // @ts-expect-error This function exists in WASM
  alert((await base64ToWASM(wasmPayload)).fib(10));
};

export { h, diff, createElement, runWASM };
