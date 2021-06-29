#!/usr/bin/env bash

source $(dirname "$0")/helpers.sh

pending "Checking for errors..."
source scripts/check.sh &>/dev/null || fail "checks" "sh scripts/check.sh"
success "No errors found."
pending "Building distribution bundles..."
yarn build &>/dev/null || fail "build" "yarn build"
success "Built distribution bundles."
info "Run \`np\` to publish."