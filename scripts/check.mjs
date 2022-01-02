import { $ } from 'zx';
$.verbose = false;

$`pnpm cleanup`;
$`pnpm lint`;
$`pnpm test`;
