import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';

const CountUp = dynamic(() => import('react-countup'), {
  loading: () => <span>70</span>,
  ssr: false,
});

export function Hero() {
  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative pt-20 md:pt-36 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-extrabold text-5xl md:text-6xl xl:text-7xl">
              Make React{' '}
              <span className="gradient-text inline-block">
                <span className="font-mono">
                  <CountUp start={10} end={70} useEasing />
                </span>
                % faster
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-400 leading-8">
              The{' '}
              <span className="font-medium dark:text-zinc-100">
                Virtual DOM Replacement
              </span>{' '}
              for React. Gain big performance wins for UI and data heavy React
              apps. Dead simple to use – try it out with{' '}
              <Link href="/docs" className="font-medium hover:underline">
                just one plugin
              </Link>
              .
            </p>
            <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <Link
                href="/docs"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-purple-600 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span className="relative text-base font-semibold text-white">
                  Get Started →
                </span>
              </Link>
              <a
                href="https://www.youtube.com/watch?v=VkezQMb1DHw"
                target="_blank"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
              >
                <span className="relative text-base font-semibold text-purple-600 dark:text-white">
                  ▶️ Million.js in 100 seconds
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="lg:w-2/3 text-center mx-auto">
          <Companies />
        </div>
      </Container>
    </div>
  );
}

export function Blur() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
    >
      <div className="fix-safari-blur blur-[106px] h-56 bg-gradient-to-br from-purple-500 to-purple-400 dark:from-purple-700"></div>
      <div className="fix-safari-blur blur-[106px] h-32 bg-gradient-to-r from-purple-400 to-purple-300 dark:to-purple-600"></div>
    </div>
  );
}

function Companies() {
  const entries = [
    {
      url: 'https://wyze.com',
      component: <WyzeLogo />,
    },
    {
      url: 'https://vercel.com',
      component: <VercelLogo />,
    },
    {
      url: 'https://dimension.dev',
      component: (
        <div className="flex items-center gap-3 text-xl font-semibold">
          <DimensionLogo /> Dimension
        </div>
      ),
    },
    {
      url: 'https://cerebrum.com',
      component: (
        <div className="flex items-center gap-3 text-xl font-semibold">
          <CerebrumLogo /> Cerebrum
        </div>
      ),
    },
    {
      url: 'https://www.theatrejs.com/',
      component: <TheatreJSLogo />,
    },
  ];

  return (
    <div className="mt-36 text-center lg:mt-32 md:block hidden">
      <span className="uppercase text-sm font-semibold tracking-wider text-gray-800 dark:text-white">
        Used / sponsored by companies
      </span>
      <div className="slider">
        <div className="slide-track mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-around items-center">
          {[...entries, ...entries].map(({ component, url }) => (
            <div className="slide grayscale opacity-60 hover:opacity-100 transition duration-200 hover:grayscale-0">
              <a href={url} target="_blank">
                {component}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WyzeLogo() {
  return (
    <svg
      width="100"
      height="23"
      viewBox="0 0 96 21"
      fill="none"
      className="invert dark:invert-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Wyze</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.7772 0.191406H10.8936L14.7772 8.03827L11.379 14.8466L4.09734 0.191406H0.213745L10.1655 20.3855H12.5927L16.719 12.0771L20.8453 20.3855H23.2726L33.2243 0.191406H29.3407L22.0589 14.962L14.7772 0.191406Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M51.671 0.191406L44.9961 10.3461L38.3212 0.191406H34.1949L43.297 13.9234V20.2701H46.8166V13.9234L55.7973 0.191406H51.671Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 20.3854H95.9683V16.9236H77.5212V20.3854Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 3.65326H95.9683V0.191406H77.5212V3.65326Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 11.9619H95.9683V8.5H77.5212V11.9619Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M56.8897 0.191406V3.53786H69.0259L55.4333 20.3855H75.2154V17.0391H62.7151L76.4289 0.191406H56.8897Z"
        fill="white"
      ></path>
    </svg>
  );
}

function DimensionLogo() {
  return (
    <Image
      src="https://beta.dimension.dev/logo.svg"
      alt="Dimension"
      className="dark:invert"
      width={25}
      height={33.13}
    />
  );
}

function CerebrumLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 pr-2 rounded-full md:pr-0 sm:h-10"
      data-name="Layer 1"
      viewBox="0 0 300 300"
    >
      <defs>
        <radialGradient
          id="a"
          cx="24.323"
          cy="103.366"
          r="204.365"
          gradientTransform="translate(57.84 46.622) scale(1.0691)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.317" stopColor="#63f"></stop>
          <stop offset="0.338" stopColor="#6634ff" stopOpacity="0.962"></stop>
          <stop offset="0.528" stopColor="#673aff" stopOpacity="0.625"></stop>
          <stop offset="0.696" stopColor="#683fff" stopOpacity="0.357"></stop>
          <stop offset="0.835" stopColor="#6942ff" stopOpacity="0.164"></stop>
          <stop offset="0.941" stopColor="#6944ff" stopOpacity="0.045"></stop>
          <stop offset="1" stopColor="#6945ff" stopOpacity="0"></stop>
        </radialGradient>
        <radialGradient
          id="c"
          cx="152.954"
          cy="104.245"
          r="79.257"
          gradientTransform="translate(-.462 -4.31) scale(1.0876)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e97656"></stop>
          <stop offset="0.262" stopColor="#ff26e2"></stop>
          <stop offset="0.683" stopColor="#aa32ff"></stop>
          <stop offset="0.958" stopColor="#3cc8f5"></stop>
        </radialGradient>
        <linearGradient
          id="b"
          x1="2.781"
          x2="286.493"
          y1="150.053"
          y2="150.053"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6945ff"></stop>
          <stop offset="1" stopColor="#2592fb"></stop>
        </linearGradient>
      </defs>
      <path
        fill="url(#a)"
        d="M218.849 150.053a68.587 68.587 0 00-5.027-25.818l72.67-29.414a147.608 147.608 0 01-.904 112.67l-72.178-30.584a68.592 68.592 0 005.439-26.854z"
      ></path>
      <path
        fill="url(#b)"
        d="M198.694 198.711a68.814 68.814 0 01-112.444-22.84l-.16.065.087-.179a68.908 68.908 0 01.385-52.6l.1.043a68.824 68.824 0 01127.16 1.035l72.671-29.415a147.257 147.257 0 00-271.994-2.238l-.11-.046a147.607 147.607 0 00-.86 112.67l.151.039-.101.04a147.257 147.257 0 00272.009 2.205l-72.178-30.583a68.925 68.925 0 01-14.716 21.804z"
      ></path>
      <path
        fill="#fff"
        d="M86.25 176.49a68.897 68.897 0 0036.517 37.373l2.973 9.772 74.054 4.282a10.205 10.205 0 0010.794-10.188v-33.964H228.3l-10.204-43.26-2.627-11.143q-.748-2.29-1.647-4.51a68.838 68.838 0 00-127.16-1.034l-.1-.043a68.914 68.914 0 00-.384 52.6z"
      ></path>
      <path
        fill="#d1d3d4"
        d="M164.632 218.34c-8.242-3.152-15.382-7.05-18.232-11.647-4.883-7.876-4.997 4.239-4.642 12.041.147 3.248.376 5.75.376 5.75l59.67 3.45s-20.768-3.32-37.172-9.594z"
      ></path>
      <circle
        cx="182.133"
        cy="155.514"
        r="8.484"
        transform="rotate(-17.634 182.132 155.514)"
      ></circle>
      <path
        fill="url(#c)"
        d="M185.557 124.915a12.405 12.405 0 00-2.143-5.165 44.364 44.364 0 00-79.005 37.05 44.898 44.898 0 003.687 9.466c.123.233.255.456.392.672a9.402 9.402 0 0016.507-1.456c.362-.842.735-1.691 1.121-2.54 4.229-9.295 10.03-18.477 21.199-17.4a50.828 50.828 0 0019.779-2.026 57.751 57.751 0 0012.27-5.393 12.87 12.87 0 006.193-13.208z"
      ></path>
    </svg>
  );
}

function TheatreJSLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="102"
      height="25"
      fill="#fff"
      className="invert dark:invert-0"
      viewBox="0 0 102 25"
    >
      <path d="M99.588 15.156L94.95 8.167l-.003-.004c-.757-1.168-1.142-2.33-1.142-3.451 0-.827.206-1.575.578-2.108.416-.595 1.014-.897 1.778-.897.59 0 1.105.165 1.53.49.399.305.73.755.987 1.338l.052.119a.23.23 0 00.14.126c.063.02.132.013.19-.02l.112-.064.967-.558.002-.001.102-.06a.226.226 0 00.08-.315l-.059-.094-.002-.003c-.835-1.355-2.291-2.1-4.101-2.1-1.315 0-2.502.435-3.344 1.226-.844.794-1.309 1.912-1.309 3.152 0 1.57.362 2.735 1.29 4.154a.071.071 0 00.005.008l4.632 7.01.004.008c.972 1.448 1.445 2.739 1.445 3.945 0 1.028-.223 1.887-.644 2.484-.458.65-1.146.98-2.046.98-.9 0-1.635-.333-2.138-.99-.463-.607-.718-1.485-.718-2.474v-.77a.23.23 0 00-.231-.228h-1.934a.23.23 0 00-.231.228v.934c0 2.533 2.258 4.443 5.253 4.443 1.488 0 2.758-.465 3.672-1.344.903-.871 1.381-2.067 1.381-3.46 0-1.492-.543-3.035-1.659-4.715z"></path>
      <path
        fillRule="evenodd"
        d="M43.332 23.909l.126.175c.05.07.056.161.016.237a.232.232 0 01-.205.123h-2.7a.233.233 0 01-.192-.101.226.226 0 01-.022-.214l.066-.158c.207-.494.2-.818.115-1.24l-.002-.01-.85-4.544h-5.46l-.515 2.836v.001l-.017.093a.23.23 0 01-.228.188h-.702a.233.233 0 01-.178-.081.225.225 0 01-.05-.187l.024-.133 3.204-17.849.001-.004c.083-.473.108-.767.087-1.016-.02-.236-.085-.45-.227-.743V1.28l-.078-.161a.224.224 0 01.014-.22.232.232 0 01.196-.106h1.718c.724 0 1.37.553 1.508 1.288l.002.009 3.87 20.505.001.002.001.006.01.056c.06.366.13.78.465 1.247l.002.003zM36.911 3.49l-2.46 13.545h5.007L36.911 3.49z"
        clipRule="evenodd"
      ></path>
      <path d="M.232.794h9.576a.23.23 0 01.232.228v.687a.23.23 0 01-.232.228h-3.64v20.756c0 .25.009.429.048.61.04.188.118.387.25.648l.084.165a.225.225 0 01-.01.222.233.233 0 01-.198.107H3.698a.233.233 0 01-.197-.108.226.226 0 01-.01-.222l.083-.165c.133-.26.21-.46.25-.648.04-.18.047-.36.047-.61V1.936H.231A.23.23 0 010 1.71v-.687A.23.23 0 01.232.794zM67.1 1.289c.134.261.21.461.25.648.04.18.048.36.048.61v16.945a.23.23 0 00.231.228h7.374a.23.23 0 00.231-.228v-.687a.23.23 0 00-.231-.227h-5.308V9.056h5.308a.23.23 0 00.231-.227v-.687a.23.23 0 00-.231-.227h-5.308V1.937h5.308a.23.23 0 00.231-.228v-.687a.23.23 0 00-.231-.228h-7.779c-.08 0-.155.041-.197.109a.223.223 0 00-.01.221l.083.165z"></path>
      <path
        fillRule="evenodd"
        d="M76.078 22.765l.267.394.064.097a.227.227 0 01-.067.317l-.098.063h-.002l-.001.001h-.001c-1.251.797-2.784 1.201-4.557 1.201-1.916 0-3.429-.33-4.763-1.041-1.29-.687-2.452-1.755-3.66-3.361v-.001a54.879 54.879 0 01-1.58-2.226l-.128-.188c-.466-.681-.886-1.284-1.304-1.762-.433-.494-.841-.825-1.284-1.041-.465-.228-.982-.34-1.617-.353v9.352a.23.23 0 01-.232.228h-1.833a.23.23 0 01-.232-.228V2.547c0-.25-.008-.43-.047-.61a2.67 2.67 0 00-.25-.648l-.084-.165a.223.223 0 01.01-.222.233.233 0 01.197-.108h3.092c1.998 0 3.662.655 4.812 1.896 1.14 1.23 1.742 3.007 1.742 5.14 0 3.189-1.523 5.624-4.041 6.579 1.735.866 3.063 2.542 4.772 4.862l.005.006c1.972 2.687 3.774 4.353 6.66 4.353 1.567 0 2.667-.287 3.676-.959l.096-.063a.234.234 0 01.323.061l.064.094v.002zM57.567 1.937h-.22V13.72h.22c1.496 0 2.642-.525 3.405-1.56.743-1.008 1.119-2.374 1.119-4.332 0-1.958-.326-3.377-.998-4.338-.73-1.046-1.884-1.554-3.526-1.554z"
        clipRule="evenodd"
      ></path>
      <path d="M86.889.794h1.834a.23.23 0 01.232.228v18.717c0 1.45-.472 2.681-1.366 3.56-.915.9-2.225 1.375-3.787 1.375-1.81 0-3.267-.746-4.102-2.1l-.061-.099a.225.225 0 01.08-.315l.102-.059h.002l1.079-.622a.236.236 0 01.19-.02.23.23 0 01.14.125l.05.115v.002l.002.002c.256.584.589 1.034.987 1.339.426.324.94.49 1.53.49 1.035 0 1.772-.395 2.253-1.205.394-.666.603-1.618.603-2.752V1.022a.23.23 0 01.232-.228zM36.152 23.41l-.267-.36-.064-.09a.235.235 0 00-.317-.055l-.09.06-.002.001c-.35.23-.713.336-1.142.336h-7.328V12.01h5.575a.23.23 0 00.232-.228v-.687a.23.23 0 00-.232-.228h-5.575v-8.93h5.575a.23.23 0 00.232-.228v-.687a.23.23 0 00-.232-.228h-8.045c-.08 0-.155.04-.198.108a.222.222 0 00-.01.221l.084.164v.002c.133.261.21.461.25.647.04.181.047.362.047.61v21.671a.23.23 0 00.231.228h9.527c.668 0 1.171-.17 1.684-.565l.087-.069a.225.225 0 00.044-.313l-.066-.089v.001zM76.724 23.283c0-.713.59-1.293 1.315-1.293s1.315.58 1.315 1.293-.59 1.293-1.315 1.293-1.316-.58-1.316-1.293zM21.81 23.95c-.133-.26-.21-.46-.251-.648a2.824 2.824 0 01-.047-.61V1.022a.23.23 0 00-.231-.228h-1.834a.23.23 0 00-.231.228v12.7h-5.579v-12.7a.23.23 0 00-.231-.228h-1.834a.23.23 0 00-.231.228v23.195a.23.23 0 00.232.228h1.833a.23.23 0 00.231-.228v-9.353h5.579v9.353a.23.23 0 00.231.228h2.24c.08 0 .154-.041.197-.108a.224.224 0 00.01-.222l-.084-.165zM43.609.794h9.576a.23.23 0 01.231.228v.687a.23.23 0 01-.231.228h-3.64v20.755c0 .25.008.43.047.61.04.188.118.387.25.648l.002.002.082.163a.225.225 0 01-.01.222.233.233 0 01-.197.107h-2.645a.232.232 0 01-.197-.108.225.225 0 01-.01-.221l.084-.165c.133-.26.21-.46.25-.648.039-.18.047-.36.047-.61V1.936h-3.64a.23.23 0 01-.231-.227v-.687a.23.23 0 01.232-.228z"></path>
    </svg>
  );
}

function VercelLogo() {
  return (
    <svg
      aria-label="Vercel logotype"
      height="64"
      role="img"
      className="h-6 dark:invert"
      viewBox="0 0 283 64"
    >
      <path
        d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm117.14-14.5c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm-39.03 3.5c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9v-46h9zM37.59.25l36.95 64H.64l36.95-64zm92.38 5l-27.71 48-27.71-48h10.39l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10v14.8h-9v-34h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
        fill="black"
      ></path>
    </svg>
  );
}
