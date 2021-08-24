export PATH="$(dirname "$0")/../node_modules/.bin:$PATH"

COLOR_RED=`tput setaf 1`
COLOR_GREEN=`tput setaf 2`
COLOR_YELLOW=`tput setaf 3`
COLOR_BLUE=`tput setaf 4`
RESET=`tput sgr0`
SPACER='                    '

function info {
  printf "${COLOR_BLUE}info    ${RESET}- $1${RESET}"
}

function success {
  printf "\r${COLOR_GREEN}success ${RESET}- $1${SPACER}${RESET}\n"
}

function fail {
  printf "\r${COLOR_RED}fail    ${RESET}- Failed during $1. Run \`$2\`.${SPACER}${RESET}\n";
  exit 0;
}
