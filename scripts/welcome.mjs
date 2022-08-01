import { $ } from 'zx';
import { say, sleep, typing } from './helpers.mjs';
$.verbose = false;

let current;

const send = async (message, time) => {
  current = typing('Mil is typing');
  await sleep(time);
  current.stop();
  say(message);
};

await send(
  `Hi there! I'm ${chalk.magenta(
    'Mil the Lion',
  )}! Welcome to the Million codebase!`,
  1000,
);

await send(
  `${chalk.bold('Note:')} Make sure you've read over ${chalk.gray(
    '`.github/CONTRIBUTING.md`',
  )} && ${chalk.gray('`.github/CODE_OF_CONDUCT.md`')}.`,
  3000,
);

await send(
  `First, let's spin up our first dev environment! To do so, you'll need to run ${chalk.gray(
    '`pnpm run`',
  )}. Since this is your first time, I'll run it for you:`,
  7000,
);

console.log();
await send(chalk.bold(chalk.gray('$ pnpm run dev')), 3000);
console.log();
$`pnpm run dev`;

await send(
  `A new tab should have opened! Try editing ${chalk.gray(
    '`dev/script.tsx`',
  )} to make changes. In this file you can write any valid React code and it'll work out of the box!`,
  5000,
);

await send(
  `Now you're ready to rock and roll! If you have any questions, make an issue or discussion on the GitHub repo.`,
  5000,
);

await send(`See ya later!`, 2000);
