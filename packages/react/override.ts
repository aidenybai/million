/* eslint-disable no-console */
export const shutUpReact = () => {
  const consoleOverride =
    (callback: any) =>
    (message: string, ...rest) => {
      if (
        message.startsWith('Warning:') ||
        message.startsWith('Invalid hook call.')
      )
        return;
      callback(message, rest);
    };

  console.warn = consoleOverride(console.warn);
  console.error = consoleOverride(console.error);
};
