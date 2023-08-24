import Image from 'next/image';
import Link from 'next/link';
import Wyze from '../../pages/showcase/wyze.png';
import DonaAI from '../../pages/showcase/dona-ai.jpeg';
import T4Stack from '../../pages/showcase/t4stack.png';
import VeganCheck from '../../pages/showcase/vegancheck.png';
import Windows11Web from '../../pages/showcase/windows-11-web.jpeg';
import { Container } from './container';

export function Showcase() {
  const entries = [
    {
      image: Wyze,
      name: 'Wyze',
      url: 'wyze.com',
    },
    {
      image: DonaAI,
      name: 'Dona AI',
      url: 'dona.ai',
    },
    {
      image: T4Stack,
      name: 'T4 Stack',
      url: 't4stack.com',
    },
    {
      image: VeganCheck,
      name: 'Vegan Check',
      url: 'vegancheck.me',
    },
    {
      image: Windows11Web,
      name: 'Windows 11',
      url: 'windows11web.com',
    },
  ];
  return (
    <div className="my-42 relative">
      <Container>
        <div className="mb-16">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">
            Faster than the rest
          </h2>
          <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300 md:text-md lg:text-lg">
            Real companies and projects use Million.js in production to deliver
            incredible user experiences.
          </p>
        </div>
        <div className="slider">
          <div className="slide-track-10 mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
            {[...entries, ...entries, ...entries].map(
              ({ image, name, url }) => (
                <a
                  href={`https://${url}`}
                  target="_blank"
                  className=" pr-10 space-y-6 text-center slide grayscale-[50%] opacity-90 hover:opacity-100 transition duration-200 hover:grayscale-0"
                >
                  <Image
                    src={image}
                    alt={name}
                    width={256}
                    height={288}
                    className="mx-auto h-32 w-72 md:h-40 md:w-24 lg:h-32 lg:w-72 rounded-lg object-cover object-top hover:rotate-[-1deg] hover:scale-110 hover:shadow-lg lg:hover:shadow-2xl transition"
                  />
                  <div>
                    <h4 className="text-2xl text-gray-700 dark:text-white">
                      {name}
                    </h4>
                    <span className="block text-sm text-gray-500">{url}</span>
                  </div>
                </a>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-8 items-center">
          <Link
            href="/showcase"
            className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
          >
            <span className="relative text-base font-semibold text-purple-600 dark:text-white">
              View the Million.js showcase
            </span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
