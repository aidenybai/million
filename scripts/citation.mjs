import { $ } from 'zx';
import { write } from 'fsxx';
import simpleGit from 'simple-git';
import { fail, success } from './helpers.mjs';
import { readFile } from 'fs/promises';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

$.verbose = false;
const git = simpleGit();

try {
  await write(
    './CITATION.cff',
    `cff-version: 1.2.0
message: 'If you use this software, please cite it as below.'
url: 'https://github.com/aidenybai/million'
authors:
  - family-names: 'Bai'
    given-names: 'Aiden'
    orcid: 'https://orcid.org/0000-0002-3676-3726'
title: 'Million.js: A Fast, Compiler-Augmented Virtual DOM For Performant JavaScript UI Libraries'
version: ${version}
doi: 10.48550/arXiv.2202.08409
date-released: ${new Date().toISOString().slice(0, 10)}`,
  );
} catch (_err) {
  fail('build', 'pnpm run release');
}
success('Updated CITATION.cff');
await git.add('./CITATION.cff').commit(`chore: bump CITATION.cff version`).push('origin', 'main');
