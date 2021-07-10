#!/usr/bin/env bash

export PATH="$(dirname "$0")/../node_modules/.bin:$PATH"

SPACER='                    '

function pending {
  printf "⚠ $1"
}

function info {
  printf "ⓘ $1\n"
}

function success {
  printf "\r✓ $1${SPACER}\n"
}

function fail {
  printf "\r✗ Error during $1. Run \`$2\`.${SPACER}\n";
  exit 1;
}
