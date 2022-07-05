import ora from 'ora';

const SPACER = ' '.repeat(20);
let i = 0;

export const load = (message) => {
  const loader = ora({
    text: `${chalk.bold(chalk.blue('info    '))}- ${message}`,
    spinner: 'arc',
    color: 'blue',
  });
  loader.start();
  return loader;
};

export const info = (message) => console.log(`${chalk.bold(chalk.blue('→ info    '))}- ${message}`);

export const success = (message) =>
  console.log(`${chalk.bold(chalk.green('✔ success '))}- ${message}${SPACER}`);

export const fail = async (message, fix) => {
  console.log(
    `${chalk.bold(chalk.red('✘ fail    '))}- Failed during ${message}. Run ${fix}.${SPACER}`,
  );
  await $`exit 1`;
};

export const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

export const say = (message) =>
  console.log(`${chalk.gray(`[${i++}]`)} ${chalk.bold(chalk.magenta('→'))} ${message}`);

export const typing = (message) => {
  const loader = ora({
    text: chalk.gray(message),
    spinner: 'simpleDots',
    color: 'gray',
  });
  loader.start();
  return loader;
};
