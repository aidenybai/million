#!/usr/bin/env bash

source $(dirname "$0")/helpers.sh

rm -rf dist
rollup -c
mv dist/types/million.esm.d.ts dist/million.d.ts

sed -i '' 's/export type/export/g' dist/million.d.ts

info "Dist: `ls -xm -d dist/*`"