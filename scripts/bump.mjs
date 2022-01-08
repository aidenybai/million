import { $ } from 'zx';

await $`bumpp prerelease --commit --push --tag && pnpm publish`;
