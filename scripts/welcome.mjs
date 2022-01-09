import { $, question } from 'zx';
import { sleep, say, typing } from './helpers.mjs';
$.verbose = false;

let current;

const send = async (message, time) => {
  current = typing('Mil is typing');
  await sleep(time);
  current.stop();
  say(message);
};

await send(`Hi there! I'm ${chalk.red('Mil the Lion')}! Welcome to the Million codebase!`, 2000);
await send(`Before we get started, make sure you have ${chalk.gray('`pnpm`')} installed.`, 3000);
await send(
  `You can install ${chalk.gray('`pnpm`')} by running ${chalk.gray('`npm i -g pnpm`')}.`,
  3000,
);
const hasPnpmInstalled =
  (await question(`${chalk.red('→')} Do you have pnpm? ${chalk.gray('(yes/no)')} `)) === 'yes';
if (!hasPnpmInstalled) throw new Error('Please install `pnpm`');
await send(`Ok! Let me install the necessary packages for you.`, 3000);
await $`pnpm i`;
await send(
  `Packages installed! Please read ${chalk.gray('`.github/CONTRIBUTING.md`')} && ${chalk.gray(
    '`.github/CODE_OF_CONDUCT.md`',
  )} to get started!`,
  3000,
);
await send(
  `${chalk.bold('Tip:')} You can spin up a dev environment by running ${chalk.gray('`pnpm dev`')}!`,
  3000,
);
await send(`Alright! I'll see ya around!`, 3000);
