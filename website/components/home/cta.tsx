import Link from 'next/link';
import { Container } from './container';
import { Blur } from './hero';

export function CTA() {
  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative">
          <div className="mt-64 m-auto space-y-6 md:w-8/12 lg:w-7/12">
            <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
              Get started in seconds
            </h1>
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
