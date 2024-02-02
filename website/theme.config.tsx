import React from 'react';
import { useRouter } from 'next/router';
import { type DocsThemeConfig, useConfig } from 'nextra-theme-docs';
import { GitHubIcon } from '@components/icons/github-icon';
import { DiscordIcon } from '@components/icons/discord-icon';
import { TwitterXIcon } from '@components/icons/twitter-x-icon';
import packageJson from '../package.json' assert { type: 'json' };
import { ExtraContent } from './components/extra-content';

const config: DocsThemeConfig = {
  logo: () => {
    return (
      <span>
        <svg style={{ height: '1.8rem' }} viewBox="0 0 566 119" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M43.2861 100.407C50.9973 89.3692 66.6897 81.813 84.794 81.813C102.898 81.813 118.591 89.3692 126.302 100.407C118.591 111.444 102.898 119 84.794 119C66.6897 119 50.9973 111.444 43.2861 100.407Z"
            fill="url(#paint0_radial_1449_2)"
          />
          <path
            d="M43.006 18.3961C50.7123 7.47595 66.3946 0 84.4874 0C102.58 0 118.263 7.47595 125.969 18.3961C118.263 29.3163 102.58 36.7922 84.4874 36.7922C66.3946 36.7922 50.7123 29.3163 43.006 18.3961Z"
            fill="url(#paint1_radial_1449_2)"
          />
          <path
            d="M85.2801 59.7175C74.0684 70.5465 58.8619 76.6302 43.006 76.6302C27.1502 76.6302 11.9437 70.5465 0.731934 59.7175L43.006 18.3961L85.2801 59.7175Z"
            fill="url(#paint2_radial_1449_2)"
          />
          <path
            d="M168.344 59.7378C157.132 70.5668 141.925 76.6505 126.07 76.6505C110.214 76.6505 95.0073 70.5668 83.7955 59.7378L126.07 18.3961L168.344 59.7378Z"
            fill="url(#paint3_radial_1449_2)"
          />
          <path
            d="M189.3 92V37.6H210.4L211.4 45.6H212.4C214.133 42.6667 216.533 40.4333 219.6 38.9C222.733 37.3667 226.367 36.6 230.5 36.6C234.9 36.6 238.733 37.5 242 39.3C245.267 41.0333 247.733 43.7667 249.4 47.5H250.4C252.6 43.5 255.433 40.7 258.9 39.1C262.367 37.4333 266.333 36.6 270.8 36.6C275.467 36.6 279.467 37.5333 282.8 39.4C286.2 41.2 288.8 44 290.6 47.8C292.4 51.5333 293.3 56.3667 293.3 62.3V92H271.2V65.1C271.2 62.7667 270.967 60.7 270.5 58.9C270.033 57.1 269.167 55.7 267.9 54.7C266.7 53.6333 264.933 53.1 262.6 53.1C260.4 53.1 258.533 53.5667 257 54.5C255.467 55.4333 254.3 56.7333 253.5 58.4C252.7 60 252.3 61.8667 252.3 64V92H230.3V64.9C230.3 62.6333 230.067 60.6333 229.6 58.9C229.2 57.1 228.367 55.7 227.1 54.7C225.833 53.6333 224 53.1 221.6 53.1C219.4 53.1 217.533 53.6 216 54.6C214.533 55.5333 213.4 56.8333 212.6 58.5C211.8 60.1 211.4 61.9333 211.4 64V92H189.3ZM301.898 92V37.6H323.998V92H301.898ZM301.898 32V19.1H323.998V32H301.898ZM332.659 92V19.1H354.759V92H332.659ZM363.421 92V19.1H385.521V92H363.421ZM394.183 92V37.6H416.283V92H394.183ZM394.183 32V19.1H416.283V32H394.183ZM456.545 93C451.478 93 446.878 92.4 442.745 91.2C438.611 89.9333 435.045 88.1 432.045 85.7C429.111 83.3 426.845 80.3667 425.245 76.9C423.645 73.3667 422.845 69.3333 422.845 64.8C422.845 58.8 424.245 53.7 427.045 49.5C429.845 45.3 433.745 42.1 438.745 39.9C443.811 37.7 449.745 36.6 456.545 36.6C461.611 36.6 466.211 37.2333 470.345 38.5C474.478 39.7 478.011 41.5 480.945 43.9C483.945 46.3 486.245 49.2667 487.845 52.8C489.445 56.2667 490.245 60.2667 490.245 64.8C490.245 70.7333 488.845 75.8333 486.045 80.1C483.311 84.3 479.411 87.5 474.345 89.7C469.345 91.9 463.411 93 456.545 93ZM456.545 76.3C459.145 76.3 461.311 75.8333 463.045 74.9C464.778 73.9667 466.078 72.6333 466.945 70.9C467.811 69.1667 468.245 67.1333 468.245 64.8C468.245 63 467.978 61.4 467.445 60C466.978 58.5333 466.245 57.3 465.245 56.3C464.311 55.3 463.111 54.5333 461.645 54C460.178 53.4667 458.478 53.2 456.545 53.2C454.011 53.2 451.878 53.6667 450.145 54.6C448.411 55.5333 447.111 56.8667 446.245 58.6C445.378 60.3333 444.945 62.4 444.945 64.8C444.945 66.6 445.178 68.2 445.645 69.6C446.178 71 446.911 72.2 447.845 73.2C448.845 74.2 450.045 74.9667 451.445 75.5C452.911 76.0333 454.611 76.3 456.545 76.3ZM496.722 92V37.6H518.022L518.822 45.5H519.822C521.422 42.7 523.922 40.5333 527.322 39C530.789 37.4 534.355 36.6 538.022 36.6C541.555 36.6 544.755 37.0333 547.622 37.9C550.489 38.7667 552.955 40.2 555.022 42.2C557.089 44.1333 558.689 46.7333 559.822 50C560.955 53.2667 561.522 57.3 561.522 62.1V92H539.422V66C539.422 63.4667 539.155 61.2333 538.622 59.3C538.155 57.3667 537.222 55.8667 535.822 54.8C534.489 53.6667 532.555 53.1 530.022 53.1C527.689 53.1 525.689 53.6333 524.022 54.7C522.355 55.7 521.055 57.1 520.122 58.9C519.255 60.6333 518.822 62.6333 518.822 64.9V92H496.722Z"
            fill="currentColor"
          />
          <defs>
            <radialGradient
              id="paint0_radial_1449_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(84.794 100.406) rotate(92.849) scale(12.0136 26.7792)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint1_radial_1449_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(84.5378 38.3252) rotate(92.7908) scale(24.7615 54.0709)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint2_radial_1449_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(84.5378 38.3252) rotate(92.7908) scale(24.7615 54.0709)"
            >
              <stop stopColor="#845CE7" />
              <stop offset="1" stopColor="#AF73D8" />
            </radialGradient>
            <radialGradient
              id="paint3_radial_1449_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(84.5378 38.3252) rotate(92.7908) scale(24.7615 54.0709)"
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
    icon: <GitHubIcon />,
  },
  chat: {
    link: 'https://discord.gg/X9yFbcV2rF',
    icon: <DiscordIcon />,
  },
  docsRepositoryBase: 'https://github.com/aidenybai/million/tree/main/website/',
  footer: {
    text: (
      <div className="flex flex-col items-start gap-6 xl:flex-row   w-full justify-between">
        <div>© 2021-{new Date().getFullYear()} Million Software, Inc.</div>

        <div>
          <p className="text-base pb-2 text-white font-bold">Resources</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="/docs" className="text-sm">
                Documentation
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-base pb-2 text-white font-bold">Ecosystem</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="/showcase" className="text-sm">
                Showcase
              </a>
            </li>
            <li>
              <a
                href="https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md"
                className="text-sm"
              >
                Contributing
              </a>
            </li>
            <li>
              <a href="https://million.dev/chat" className="text-sm">
                Discord
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-base pb-2 text-white font-bold">About</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="/foundation" className="text-sm">
                Million Foundation
              </a>
            </li>
          </ul>
        </div>

        <a
          href="https://vercel.com?utm_source=millionjs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 212 44"
            className="h-8"
            width="212"
          >
            <rect width="212" height="44" fill="#000" rx="8"></rect>
            <path
              fill="#fff"
              d="M60.438 15.227V26.5h1.406v-4.023h2.836c2.117 0 3.625-1.493 3.625-3.602 0-2.148-1.477-3.648-3.61-3.648h-4.257zm1.406 1.25h2.484c1.633 0 2.531.851 2.531 2.398 0 1.492-.93 2.352-2.53 2.352h-2.485v-4.75zm11.5 10.171c2.399 0 3.883-1.656 3.883-4.359 0-2.71-1.484-4.36-3.883-4.36-2.398 0-3.883 1.65-3.883 4.36 0 2.703 1.485 4.36 3.883 4.36zm0-1.21c-1.594 0-2.492-1.157-2.492-3.149 0-2 .898-3.148 2.492-3.148 1.594 0 2.492 1.148 2.492 3.148 0 1.992-.898 3.148-2.492 3.148zm15.954-7.36h-1.352l-1.656 6.735h-.125l-1.883-6.735h-1.29l-1.882 6.735h-.125l-1.656-6.735h-1.36l2.36 8.422h1.36l1.874-6.516h.125l1.883 6.516h1.367l2.36-8.422zm4.523 1.04c1.336 0 2.227.984 2.258 2.476h-4.64c.101-1.492 1.039-2.477 2.382-2.477zm2.219 5.202c-.352.742-1.086 1.14-2.172 1.14-1.43 0-2.36-1.054-2.43-2.718v-.062h6.055v-.516c0-2.617-1.383-4.234-3.656-4.234-2.313 0-3.797 1.718-3.797 4.367 0 2.664 1.46 4.351 3.797 4.351 1.844 0 3.156-.89 3.547-2.328H96.04zm3.242 2.18h1.344v-5.219c0-1.187.93-2.047 2.211-2.047.266 0 .75.047.86.078V17.97a5.77 5.77 0 00-.672-.04c-1.117 0-2.086.579-2.336 1.4h-.125v-1.25h-1.281V26.5zm8.899-7.383c1.336 0 2.227.985 2.258 2.477h-4.641c.102-1.492 1.04-2.477 2.383-2.477zm2.219 5.203c-.352.742-1.086 1.14-2.172 1.14-1.43 0-2.359-1.054-2.43-2.718v-.062h6.055v-.516c0-2.617-1.383-4.234-3.656-4.234-2.313 0-3.797 1.718-3.797 4.367 0 2.664 1.461 4.351 3.797 4.351 1.844 0 3.156-.89 3.547-2.328H110.4zm6.36 2.328c1.164 0 2.164-.554 2.695-1.492h.125V26.5h1.281V14.734h-1.343v4.672h-.118c-.476-.922-1.468-1.476-2.64-1.476-2.141 0-3.539 1.718-3.539 4.36 0 2.648 1.382 4.358 3.539 4.358zm.312-7.507c1.524 0 2.477 1.218 2.477 3.148 0 1.945-.946 3.148-2.477 3.148-1.539 0-2.461-1.18-2.461-3.148 0-1.96.93-3.148 2.461-3.148zm14.462 7.507c2.133 0 3.531-1.726 3.531-4.359 0-2.648-1.391-4.36-3.531-4.36-1.156 0-2.18.571-2.641 1.477h-.125v-4.672h-1.344V26.5h1.282v-1.344h.125c.531.938 1.531 1.492 2.703 1.492zm-.313-7.507c1.539 0 2.453 1.18 2.453 3.148 0 1.969-.914 3.148-2.453 3.148-1.531 0-2.484-1.203-2.484-3.148s.953-3.148 2.484-3.148zm6.04 10.406c1.492 0 2.164-.578 2.882-2.531l3.29-8.938h-1.43l-2.305 6.93h-.125l-2.312-6.93h-1.453l3.117 8.43-.157.5c-.351 1.015-.773 1.383-1.546 1.383-.188 0-.399-.008-.563-.04V29.5c.188.031.422.047.602.047zm17.391-3.047l3.898-11.273h-2.148l-2.813 8.921h-.132l-2.836-8.921h-2.227l3.938 11.273h2.32zm8.016-7.18c1.164 0 1.93.813 1.969 2.078h-4.024c.086-1.25.899-2.078 2.055-2.078zm1.984 4.828c-.281.633-.945.985-1.906.985-1.273 0-2.094-.89-2.141-2.313v-.101h5.969v-.625c0-2.696-1.461-4.313-3.898-4.313-2.477 0-4.016 1.727-4.016 4.477s1.516 4.414 4.031 4.414c2.016 0 3.446-.969 3.797-2.524h-1.836zm3.547 2.352h1.938v-4.938c0-1.195.875-1.976 2.133-1.976.328 0 .843.055.992.11v-1.798c-.18-.054-.524-.085-.805-.085-1.101 0-2.023.625-2.258 1.468h-.132v-1.328h-1.868V26.5zm13.501-5.672c-.203-1.797-1.532-3.047-3.727-3.047-2.57 0-4.078 1.649-4.078 4.422 0 2.813 1.516 4.469 4.086 4.469 2.164 0 3.508-1.203 3.719-2.992h-1.844c-.203.89-.875 1.367-1.883 1.367-1.32 0-2.117-1.047-2.117-2.844 0-1.773.789-2.797 2.117-2.797 1.063 0 1.703.594 1.883 1.422h1.844zm5.117-1.508c1.164 0 1.93.813 1.969 2.078h-4.024c.086-1.25.899-2.078 2.055-2.078zm1.985 4.828c-.282.633-.946.985-1.907.985-1.273 0-2.093-.89-2.14-2.313v-.101h5.968v-.625c0-2.696-1.461-4.313-3.898-4.313-2.477 0-4.016 1.727-4.016 4.477s1.516 4.414 4.032 4.414c2.015 0 3.445-.969 3.796-2.524h-1.835zm3.625 2.352h1.937V14.648h-1.937V26.5zM23.325 13l9.325 16H14l9.325-16z"
            ></path>
            <path stroke="#5E5E5E" d="M43.5 0v44"></path>
          </svg>
        </a>
      </div>
    ),
  },
  navbar: {
    extraContent: <TwitterXIcon />,
  },
  head: () => {
    const { asPath, pathname, query } = useRouter();
    const id = String(query.id);
    const name = String(query.name);
    const { frontMatter } = useConfig();

    const ogConfig = {
      title: 'Million.js',
      description: 'The Virtual DOM Replacement for React',
      author: {
        twitter: 'aidenybai',
      },
      favicon: '/favicon.svg',
    };
    const favicon = String(ogConfig.favicon);
    let title = String(frontMatter.title || ogConfig.title);
    const description = String(frontMatter.description || ogConfig.description);
    const note =
      (frontMatter.date as string | undefined) ?? pathname === '/'
        ? 'million.dev'
        : pathname;
    const canonical = new URL(asPath, 'https://million.dev').toString();

    let ogUrl = `https://million.dev/default-og.png`;

    if (pathname.includes('million-3')) {
      ogUrl = `https://million.dev/v3-thumbnail.png`;
    } else {
      ogUrl = `https://million.dev/api/og?title=${title}&description=${description}&note=${note}`;
    }
    const isWrapped = pathname.startsWith('/wrapped/');
    if (isWrapped) {
      ogUrl = `https://telemetry.million.dev/api/v1/og/wrapped/${
        query.id
      }.mp4?name=${encodeURIComponent(query?.name as any)}`;
      title = query?.name + ' Wrapped';
    }

    return (
      <>
        <meta property="og:url" content={canonical} />
        <link rel="canonical" href={canonical} />

        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta name="twitter:site" content={`@${ogConfig.author.twitter}`} />
        <meta name="twitter:creator" content={`@${ogConfig.author.twitter}`} />
        {isWrapped ? <meta property="og:title" content={title} /> : null}
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={ogUrl} />
        <meta property="og:image" content={ogUrl} />
        <link rel="shortcut icon" href={favicon} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={favicon} type="image/svg+xml" />
        <meta name="apple-mobile-web-app-title" content={title} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </>
    );
  },
  sidebar: {
    toggleButton: true,
    defaultMenuCollapseLevel: 1,
  },
  search: {
    placeholder: 'Search website...',
  },
  banner: {
    dismissible: true,
    key: `version-${packageJson.version}`,
    text: (
      <a href="https://million.dev/blog/million-3" target="_blank">
        Announcing Million 3 →
      </a>
    ),
  },
  toc: {
    float: true,
    backToTop: true,
    extraContent: ExtraContent,
  },
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
  },
  themeSwitch: {
    component: null,
  },
  useNextSeoProps() {
    const { asPath } = useRouter();

    if (['/', '/docs'].includes(asPath)) {
      return { titleTemplate: 'Million.js' };
    }

    return { titleTemplate: `%s | Million.js` };
  },
  primarySaturation: 0,
};

export function hash(str: string): number {
  let hashy = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hashy = (hashy << 5) - hashy + chr;
    hashy |= 0; // Convert to 32bit integer
  }
  return hashy;
}

export default config;
