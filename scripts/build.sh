source $(dirname "$0")/helpers.sh

rm -rf dist/*
rollup -c

info "\nDist: `ls -xm -d dist/*`\n"

node scripts/fixDeclarations.mjs