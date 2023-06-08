import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Container } from './container';

const CountUp = dynamic(() => import('react-countup'), {
  loading: () => <span>0</span>,
  ssr: false,
});

export function Hero() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-purple-700"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-purple-400 to-purple-300 dark:to-purple-600"></div>
      </div>
      <Container>
        <div className="relative pt-20 md:pt-44 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
              Up to{' '}
              <span className="gradient-text inline-block">
                <span className="font-mono">
                  <CountUp end={70} />
                </span>
                % faster*
              </span>
              <br />
              React components.
            </h1>
            <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300">
              The{' '}
              <span className="font-medium dark: dark:text-zinc-100">
                virtual DOM replacement
              </span>{' '}
              you've been waiting for: Just wrap your React components with one
              function to make them faster.
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
              <Link
                href="/docs/install"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
              >
                <span className="relative text-base font-semibold text-primary dark:text-white">
                  Install
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
