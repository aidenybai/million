#!/usr/bin/env bash

export PATH="$(dirname "$0")/../node_modules/.bin:$PATH"

YELLOW_COLOR="\u001b[33m"
GREEN_COLOR="\033[0;32m"
RED_COLOR='\033[0;31m'
BLUE_COLOR='\033[0;34m'
RESET_COLOR="\u001b[39m"
SPACER='                    '

function pending {
  printf "${YELLOW_COLOR}⚠ $1${RESET_COLOR}"
}

function info {
  printf "${BLUE_COLOR}ⓘ $1${RESET_COLOR}\n"
}

function success {
  printf "\r${GREEN_COLOR}✓ $1${RESET_COLOR}${SPACER}\n"
}

function fail {
  printf "\r${RED_COLOR}✗ Error during $1. Run \`$2\`.${RESET_COLOR}${SPACER}\n";
  exit 1;
}
