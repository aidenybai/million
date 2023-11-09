import { bold, dim, magenta, cyan } from 'kleur';

let hasIntroRan = false;

export const displayIntro = () => {
  if (hasIntroRan) return;
  hasIntroRan = true;

  const tips = [
    `use ${dim('// million-ignore')} for errors`,
    `enable { mute: true } to disable info logs`,
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)] as string;

  // eslint-disable-next-line no-console
  console.log(`\n  ${bold(
    magenta(`⚡ Million.js ${process.env.VERSION || ''}`),
  )}
  - Tip:     ${tip}
  - Hotline: ${cyan('https://million.dev/hotline')}\n`);
};
