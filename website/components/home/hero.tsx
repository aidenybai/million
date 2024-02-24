import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import TextsLogo from '../../public/texts.webp';
import HackClubLogo from '../../public/hackclub.svg';
import OpenSaucedLogo from '../../public/opensauced.svg';
import MetamaskLogo from '../../public/metamask.svg';
import { RetroGrid } from '../retro-grid';
import { useTranslations } from '../../hooks/use-translations';
import { Container } from './container';
import { ShimmerButton } from './shimmer-button';
import { track } from '@vercel/analytics';

const CountUp = dynamic(() => import('react-countup'), {
  loading: () => <span>70</span>,
  ssr: false,
});

export function Hero() {
  const { hero } = useTranslations();
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleClickWizard = () => {
    track('homepage/clicked-npx-wizard');
    void navigator.clipboard.writeText('npx million@latest');
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="relative pb-10 border-b border-b-[#ffffff1a]">
      <Blur />
      <RetroGrid className="opacity-20 " />
      <Container>
        <div className="relative pt-20 md:pt-36 ml-auto">
          <div className="lg:w-[70%] text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-extrabold text-5xl md:text-6xl xl:text-7xl">
              {hero.makeReact}{' '}
              <span className="gradient-text inline-block">
                <CountUp start={10} end={70} useEasing />% {hero.faster}
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
              {hero.the}{' '}
              <span className="font-medium dark:text-zinc-100">
                {hero.dropIn}
              </span>{' '}
              {hero.forReact}{' '}
              <Link href="/docs/introduction" className="font-medium hover:underline">
                {hero.now}
              </Link>
              !
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <Link href="/docs/introduction" className="w-full sm:w-max">
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    {hero.getStarted}
                  </span>
                </ShimmerButton>
              </Link>
              <Link
                href="/blog/virtual-dom"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
              >
                <span className="relative text-base font-semibold text-purple-600 dark:text-white">
                  {hero.how}
                </span>
              </Link>
            </div>
            <button
              className="mt-6 flex flex-row items-center gap-2 mx-auto rounded-lg group"
              onClick={handleClickWizard}
            >
              <p className="text-sm text-zinc-100 dark:text-zinc-400 font-mono">
                ~ npx million@latest
              </p>
              <div className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 dark:text-zinc-300 transition-opacity">
                {submitted ? (
                  <svg
                    className="w-[16px] h-[16px] dark:text-zinc-100 pt-[1px]"
                    data-testid="geist-icon"
                    fill="none"
                    height={24}
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width={24}
                    data-open="false"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    className="w-[16px] h-[16px] dark:text-zinc-100 pt-[1px]"
                    data-testid="geist-icon"
                    fill="none"
                    height={24}
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width={24}
                    data-open="true"
                  >
                    <path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </Container>
      <Container>
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
  const { hero } = useTranslations();

  const entries = [
    {
      url: 'https://wyze.com',
      component: (
        <div key="wyze">
          <WyzeLogo />
        </div>
      ),
    },
    {
      url: 'https://metamask.io',
      component: (
        <div key="metamask">
          <div className="flex font-mono items-center gap-3 text-xl font-semibold">
            <Image
              src={MetamaskLogo as string}
              width={30}
              height={30}
              alt="METAMASK"
            />{' '}
            METAMASK
          </div>
        </div>
      ),
    },
    {
      url: 'https://hackclub.com',
      component: (
        <div key="hackclub">
          <Image
            src={HackClubLogo as string}
            width={90}
            height={30}
            alt="Hack Club"
          />
        </div>
      ),
    },
    {
      url: 'https://texts.com',
      component: (
        <div key="texts">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <Image src={TextsLogo} width={30} height={30} alt="Texts" /> Texts
          </div>
        </div>
      ),
    },
    {
      url: 'https://opensauced.pizza/',
      component: (
        <div key="opensauced">
          <Image
            src={OpenSaucedLogo as string}
            width={150}
            height={25}
            className="invert dark:invert-0"
            alt="OpenSauced"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-36 text-center lg:mt-32">
      <div className="uppercase text-sm font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
        {hero.trustedBy}{' '}
        <span className="dark:text-white text-black semibold">3M+</span>{' '}
        {hero.users}
      </div>
      <div className="slider">
        <div className="slide-track-5 hover:pause mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-around items-center">
          {[...entries, ...entries].map(({ component, url }, i) => (
            <div
              className="w-[12rem] relative grayscale opacity-60 hover:opacity-100 transition duration-200 hover:grayscale-0"
              key={i}
            >
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
