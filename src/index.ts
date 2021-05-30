import { h } from './h';
import { createElement, patch } from './patch';

export const runWASM = (): void => {
  const raw = atob('__wasm');
  const buffer = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  // @ts-expect-error it exists.
  WebAssembly.instantiate(buffer).then(obj => alert(obj.instance.exports.main()));
};

export { h, createElement, patch };
