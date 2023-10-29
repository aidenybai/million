import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import TextsLogo from '../../public/texts.webp';
import HackClubLogo from '../../public/hackclub.svg';
import OpenSaucedLogo from '../../public/opensauced.svg';
import MetamaskLogo from '../../public/metamask.svg';
import { Container } from './container';
import { ShimmerButton } from './shimmer-button';

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
          <div className="lg:w-[70%] text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-extrabold text-5xl md:text-6xl xl:text-7xl">
              Make React{' '}
              <span className="gradient-text inline-block">
                <CountUp start={10} end={70} useEasing />% faster
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
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
              <Link href="/docs" className="w-full sm:w-max">
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    Get started →
                  </span>
                </ShimmerButton>
              </Link>
              <Link
                href="/blog/virtual-dom"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
              >
                <span className="relative text-base font-semibold text-purple-600 dark:text-white">
                  How?
                </span>
              </Link>
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
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 pointer-events-none"
    >
      <div className="fix-safari-blur blur-[106px] h-56 bg-gradient-to-br from-violet-500 to-purple-400 dark:from-fuchsia-700"></div>
      <div className="fix-safari-blur blur-[106px] h-32 bg-gradient-to-r from-fuchsia-400 to-purple-300 dark:to-violet-600"></div>
    </div>
  );
}

export function Companies() {
  const entries = [
    {
      url: 'https://wyze.com',
      component: <WyzeLogo />,
    },
    {
      url: 'https://metamask.io',
      component: (
        <div className="flex font-mono items-center gap-3 text-xl font-semibold">
          <Image
            src={MetamaskLogo as string}
            width={30}
            height={30}
            alt="METAMASK"
          />{' '}
          METAMASK
        </div>
      ),
    },
    {
      url: 'https://hackclub.com',
      component: (
        <Image
          src={HackClubLogo as string}
          width={90}
          height={30}
          alt="Hack Club"
        />
      ),
    },
    {
      url: 'https://texts.com',
      component: (
        <div className="flex items-center gap-3 text-xl font-semibold">
          <Image src={TextsLogo} width={30} height={30} alt="Texts" /> Texts
        </div>
      ),
    },
    {
      url: 'https://opensauced.pizza/',
      component: (
        <Image
          src={OpenSaucedLogo as string}
          width={150}
          height={25}
          className="invert dark:invert-0"
          alt="OpenSauced"
        />
      ),
    },
  ];

  return (
    <div className="mt-36 text-center lg:mt-32">
      <div className="uppercase text-sm font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
        Trusted by companies who ship to{' '}
        <span className="dark:text-white text-black semibold">3M+</span> users
      </div>
      <div className="slider">
        <div className="slide-track-5 hover:pause mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-around items-center">
          {[...entries, ...entries].map(({ component, url }) => (
            <div className="w-[12rem] relative grayscale opacity-60 hover:opacity-100 transition duration-200 hover:grayscale-0">
              <a
                href={url}
                target="_blank"
                className="flex justify-center w-full"
              >
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
