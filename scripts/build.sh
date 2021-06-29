#!/usr/bin/env bash

source $(dirname "$0")/helpers.sh

rm -rf dist
rollup -c
mv dist/types/million.d.ts dist/million.d.ts
rm -rf dist/types

info "Dist: `ls -xm -d dist/*`"