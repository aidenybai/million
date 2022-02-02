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
url: 'https://aidenybai.com/work/million-js'
authors:
  - family-names: Bai
    given-names: Aiden
    orcid: https://orcid.org/0000-0002-3676-3726
title: 'Million.js: A Fast, Compiler-Augmented Virtual DOM For Performant JavaScript UI Libraries'
version: ${version}
date-released: 2021-7-27`,
  );
} catch (_err) {
  fail('build', 'pnpm release');
}
success('Updated CITATION.cff');
await git.add('./CITATION.cff').commit(`chore: bump CITATION.cff version`).push('origin', 'main');
