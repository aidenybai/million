source $(dirname "$0")/helpers.sh

info "Checking for errors..."
source scripts/check.sh &>/dev/null || fail "checks" "sh scripts/check.sh"
success "No errors found."
info "Building distribution bundles..."
source scripts/build.sh &>/dev/null || fail "build" "pnpm run build"
success "Built distribution bundles."
info "Please change the version number in \`CITATIONS.cff\`\n"
info "Run \`np\` to publish.\n"
