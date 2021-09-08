source $(dirname "$0")/helpers.sh

rm -rf dist/*
rollup -c
cp dist/types/million.d.ts dist/million.d.ts
cp dist/types/jsx-runtime.d.ts dist/jsx-runtime.d.ts

sed -i '' 's/export type/export/g' dist/million.d.ts

info "\nDist: `ls -xm -d dist/*`\n"
