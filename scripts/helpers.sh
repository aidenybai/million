export PATH="$(dirname "$0")/../node_modules/.bin:$PATH"

COLOR_RED=`tput setaf 1`
COLOR_GREEN=`tput setaf 2`
COLOR_YELLOW=`tput setaf 3`
COLOR_BLUE=`tput setaf 4`
START_STANDOUT=`tput smso`
END_STANDOUT=`tput rmso`
RESET=`tput sgr0`
SPACER='                    '

function pending {
  printf "${COLOR_YELLOW}${START_STANDOUT} PENDING ${END_STANDOUT} $1${RESET}"
}

function info {
  printf "${COLOR_BLUE}${START_STANDOUT} INFO ${END_STANDOUT} $1${RESET}\n"
}

function success {
  printf "\r${COLOR_GREEN}${START_STANDOUT} SUCCESS ${END_STANDOUT} $1${SPACER}${RESET}\n"
}

function fail {
  printf "\r${COLOR_RED}${START_STANDOUT} ERROR ${END_STANDOUT} Failed during $1. Run \`$2\`.${SPACER}${RESET}\n";
  exit 0;
}
