#!/usr/bin/env zx
import 'zx/globals';
import { fail, success, info } from './helpers.mjs';
$.verbose = false;

try {
  const version = await question('What is the next version? ');
  await fs.writeFile(
    './CITATION.cff',
    `cff-version: 1.1.0
message: "If you use this software, please cite it as below."
authors:
  - family-names: Bai
    given-names: Aiden
    orcid: https://orcid.org/0000-0002-3676-3726
title: "Million.js: <1kb compiler-augmented virtual DOM. It's fast!"
version: ${version}
date-released: 2021-7-27`,
  );
} catch (_err) {
  fail('build', 'pnpm postrelease');
}
success('Updated CITATION.cff');
info('Please stage, commit, and push CITATION.cff');
