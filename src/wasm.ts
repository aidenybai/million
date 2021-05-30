export const wasmPayload = '__INSERT_BASE64_WASM_HERE__';

export const base64ToWASM = async (base64: string): Promise<WebAssembly.Exports> => {
  const raw = atob(base64);
  const buffer = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  const instantiatedSource = await WebAssembly.instantiate(buffer, {});
  return instantiatedSource.instance.exports;
};
