const SPACER = ' '.repeat(20);

export const info = (message) => console.log(`${chalk.blue('info    ')}- ${message}`);

export const success = (message) => console.log(`${chalk.green('success ')}- ${message}${SPACER}`);

export const fail = async (message, fix) => {
  console.log(`${chalk.red('fail    ')}- Failed during ${message}. Run ${fix}.${SPACER}`);
  await $`exit 0`;
};
