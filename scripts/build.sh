asc wasm/main.ts -b dist/million.wasm -O3 --exportRuntime --transform as-bind
rollup -c
