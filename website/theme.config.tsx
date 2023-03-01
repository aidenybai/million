import React from 'react';
import { useRouter } from 'next/router';
import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: () => {
    return (
      <span>
        <svg style={{ height: '1.6rem' }} viewBox="0 0 459 98" fill="none">
          <path
            d="M161 77H174.5V48.5C174.5 39.5 179.6 35.6 185.3 35.6C192 35.6 196.5 39.5 196.5 48.5V77H210V48.5C210 38.5 214.3 35.6 220.6 35.6C226.7 35.6 231 39.5 231 48.5V77H244.5V45.2C244.5 32.1 235.9 23.8 224.7 23.8C215.6 23.8 210.6 27.3 207.1 33.6C203.7 27.3 197.5 23.8 190.2 23.8C182.2 23.8 177 26.8 174.3 32.6V25H161V77Z"
            fill="currentColor"
          />
          <path
            d="M254.016 77H267.516V25H254.016V77ZM252.616 12.7C252.616 17.1 256.116 20.7 260.716 20.7C265.416 20.7 268.816 17.2 268.816 12.7C268.816 8.4 265.416 4.8 260.716 4.8C256.116 4.8 252.616 8.4 252.616 12.7Z"
            fill="currentColor"
          />
          <path d="M277.5 77H291V4H277.5V77Z" fill="currentColor" />
          <path d="M300.984 77H314.484V4H300.984V77Z" fill="currentColor" />
          <path
            d="M324.469 77H337.969V25H324.469V77ZM323.069 12.7C323.069 17.1 326.569 20.7 331.169 20.7C335.869 20.7 339.269 17.2 339.269 12.7C339.269 8.4 335.869 4.8 331.169 4.8C326.569 4.8 323.069 8.4 323.069 12.7Z"
            fill="currentColor"
          />
          <path
            d="M373.653 78.3C389.753 78.3 401.353 66.1 401.353 51.1C401.353 36.1 389.753 23.8 373.653 23.8C357.553 23.8 345.953 36.1 345.953 51.1C345.953 66.1 357.553 78.3 373.653 78.3ZM359.453 51.1C359.453 43 365.053 36.1 373.653 36.1C382.253 36.1 387.853 43 387.853 51.1C387.853 59.2 382.253 66 373.653 66C365.053 66 359.453 59.2 359.453 51.1Z"
            fill="currentColor"
          />
          <path
            d="M409.328 77H422.828V48.5C422.828 39.5 427.928 35.6 433.628 35.6C440.328 35.6 444.828 39.5 444.828 48.5V77H458.328V45.2C458.328 32.1 449.728 23.8 438.528 23.8C430.528 23.8 425.328 26.8 422.628 32.6V25H409.328V77Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M34.7744 82.051C41.0759 73.0315 53.8995 66.8567 68.6942 66.8567C83.4888 66.8567 96.3125 73.0315 102.614 82.051C96.3125 91.0706 83.4888 97.2454 68.6942 97.2454C53.8995 97.2454 41.0759 91.0706 34.7744 82.051Z"
            fill="url(#paint0_radial_1406_14)"
          />
          <path
            d="M34.5459 15.0331C40.8434 6.10926 53.6588 0 68.444 0C83.2292 0 96.0446 6.10926 102.342 15.0331C96.0446 23.9569 83.2292 30.0662 68.444 30.0662C53.6588 30.0662 40.8434 23.9569 34.5459 15.0331Z"
            fill="url(#paint1_radial_1406_14)"
          />
          <path
            d="M69.0918 48.8005C59.9297 57.6498 47.5031 62.6213 34.5459 62.6213C21.5887 62.6213 9.16214 57.6498 0 48.8005L34.5459 15.0331L69.0918 48.8005Z"
            fill="url(#paint2_radial_1406_14)"
          />
          <path
            d="M136.97 48.8171C127.808 57.6664 115.382 62.6379 102.425 62.6379C89.4673 62.6379 77.0407 57.6664 67.8786 48.8171L102.425 15.0331L136.97 48.8171Z"
            fill="url(#paint3_radial_1406_14)"
          />
          <defs>
            <radialGradient
              id="paint0_radial_1406_14"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(68.6942 82.051) rotate(92.849) scale(9.81738 21.8837)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint1_radial_1406_14"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(68.4852 31.3189) rotate(92.7908) scale(20.2348 44.1861)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint2_radial_1406_14"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(68.4852 31.3189) rotate(92.7908) scale(20.2348 44.1861)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint3_radial_1406_14"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(68.4852 31.3189) rotate(92.7908) scale(20.2348 44.1861)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
          </defs>
        </svg>
        <style jsx>{`
          span {
            padding: 0.5rem 0.5rem 0.5rem 0;
            mask-image: linear-gradient(
              60deg,
              #bba0ff 25%,
              rgba(187, 160, 255, 0.2) 50%,
              #bba0ff 75%
            );
            mask-size: 400%;
            mask-position: 0%;
          }
          span:hover {
            mask-position: 100%;
            transition: mask-position 1s ease, -webkit-mask-position 1s ease;
          }
        `}</style>
      </span>
    );
  },
  project: {
    link: 'https://github.com/aidenybai/million',
  },
  chat: {
    link: 'https://discord.gg/X9yFbcV2rF',
  },
  docsRepositoryBase: 'https://github.com/aidenybai/million',
  footer: {
    text: (
      <p>
        MIT {new Date().getFullYear()} ©{' '}
        <a target="_blank" href="https://aidenybai.com">
          Aiden Bai
        </a>
      </p>
    ),
  },
  // head: () => {
  //   const { asPath } = useRouter();
  //   const { frontMatter } = useConfig();

  //   const canonical = new URL(asPath, SITE).toString();

  //   return (
  //     <>
  //       <meta property="og:url" content={canonical} />
  //       <link rel="canonical" href={canonical} />

  //       <meta
  //         name="description"
  //         content={frontMatter.description || config.description}
  //       />
  //       <meta
  //         property="og:description"
  //         content={frontMatter.description || config.description}
  //       />
  //       <meta name="twitter:site" content={`@${config.author.twitter}`} />
  //       <meta name="twitter:creator" content={`@${config.author.twitter}`} />
  //       <meta name="twitter:card" content="summary_large_image" />

  //       <link rel="shortcut icon" href={config.favicon} />
  //       <link rel="apple-touch-icon" href={config.favicon} />
  //       <meta name="apple-mobile-web-app-title" content={config.title} />
  //     </>
  //   );
  // },
  sidebar: {
    toggleButton: true,
  },
  useNextSeoProps() {
    const { asPath } = useRouter();

    const shared = {
      openGraph: {
        images: [
          {
            url: new URL(
              'https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.svg',
              'https://millionjs.org',
            ).toString(),
            width: 1328,
            height: 345,
            alt: 'Million.js banner',
            type: 'image/svg+xml',
          },
        ],
      },
    };

    if (['/', '/docs'].includes(asPath)) {
      return { ...shared, titleTemplate: 'Million.js' };
    }

    return { ...shared, titleTemplate: `%s | Million.js` };
  },
  primaryHue: 280,
};

// eslint-disable-next-line import/no-default-export
export default config;
