#!/usr/bin/env zx
import 'zx/globals';
$.verbose = false;

$`pnpm run cleanup`;
$`pnpm run lint`;
$`pnpm run test`;
