source $(dirname "$0")/helpers.sh

rm -rf dist/*
rollup -c
cp dist/types/* dist/*

sed -i '' 's/export type/export/g' dist/million.d.ts

info "\nDist: `ls -xm -d dist/*`\n"
