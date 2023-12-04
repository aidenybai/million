import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import TextsLogo from '../../public/texts.webp';
import HackClubLogo from '../../public/hackclub.svg';
import OpenSaucedLogo from '../../public/opensauced.svg';
import MetamaskLogo from '../../public/metamask.svg';
import { WyzeLogo } from '../icons/wyze';
import { Container } from './container';
import { ShimmerButton } from './shimmer-button';
import { Blur } from './blur';

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

const duplicate = entries.concat(entries).concat(entries);

export function Companies() {
  return (
    <div className="mt-36 text-center lg:mt-32">
      <div className="uppercase text-sm font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
        Trusted by companies who ship to{' '}
        <span className="dark:text-white text-black semibold">3M+</span> users
      </div>
      <div className="slider">
        <div className="slide-track-5 hover:pause mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-around items-center">
          {duplicate.map(({ component, url }, index) => (
            <div
              className="w-[12rem] relative grayscale opacity-60 hover:opacity-100 transition duration-200 hover:grayscale-0"
              key={index}
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
