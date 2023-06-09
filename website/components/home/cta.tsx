import Link from 'next/link';
import { Container } from './container';

export function CTA() {
  return (
    <div className="relative pb-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 h-max w-full m-auto grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-purple-700"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-purple-400 to-purple-300 dark:to-purple-600"></div>
      </div>
      <Container>
        <div className="relative">
          <div className="mt-6 m-auto space-y-6 md:w-8/12 lg:w-7/12">
            <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
              It's about dang time!
            </h1>
            <p className="text-center text-xl text-gray-600 dark:text-gray-300">
              Unlock the power of performance within your React components.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/docs"
                className="relative flex h-12 w-full items-center justify-center px-8 before:absolute before:inset-0 before:rounded-full before:bg-purple-600 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span className="relative text-base font-semibold text-white dark:text-dark">
                  Get Started →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
