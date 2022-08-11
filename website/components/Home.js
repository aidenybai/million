import {
  AdjustmentsIcon,
  CodeIcon,
  CursorClickIcon,
  EyeIcon,
  LightningBoltIcon,
  PaperAirplaneIcon,
  PlayIcon,
} from '@heroicons/react/outline';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Container from './Container';
import Image from 'next/image';
import Tilt from 'react-tilt';

const ModalVideo = dynamic(() => import('react-modal-video'), { ssr: false });

const features = [
  {
    name: 'Lightweight',
    description: (
      <>
        Million ships <b>&lt;1kb</b> brotli bundles after tree shaking and
        minification. Get <b>fast bundle</b> load times!
      </>
    ),
    icon: PaperAirplaneIcon,
  },
  {
    name: 'Performance',
    description: (
      <>
        Million uses the <b>latest performance optimizations</b> for the
        compiler to <b>supercharge runtime</b> rendering.
      </>
    ),
    icon: LightningBoltIcon,
  },
  {
    name: 'Compiler-first',
    description: (
      <>
        Million supports <b>full-class support for compiler</b> optimizations,
        allowing you to <b>ergonomically</b> create your own compiler over
        Million.
      </>
    ),
    icon: EyeIcon,
  },
  {
    name: 'Sensible API',
    description: (
      <>
        Million's API is <b>simple to use with batteries-included</b>. Best
        practices by default!
      </>
    ),
    icon: CodeIcon,
  },
  {
    name: 'Library Agnostic',
    description: (
      <>
        Million doesn't make decisions on library design, meaning you can
        leverage Million's generalized API to build your own opinionated
        abstractions.
      </>
    ),
    icon: CursorClickIcon,
  },
  {
    name: 'Decoupled + Composable',
    description: (
      <>
        Million is <b>extensible</b> in features, so you can build up complexity
        and features with ease (<i>like LEGO!</i>).
      </>
    ),
    icon: AdjustmentsIcon,
  },
];

export default function Page() {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Million</title>
      </Head>
      <ModalVideo
        channel="youtube"
        isOpen={isOpen}
        videoId="KgnSM9NbV2s"
        onClose={() => setOpen(false)}
      />
      <div className="px-8 pt-20 pb-20 sm:px-6 sm:pt-24 lg:px-8 text-white bg-gradient-to-b from-blackish to-color2 animate-gradient-x bg-repeat lg:flex lg:justify-content lg:gap-4">
        <div className="mx-auto max-w-xl">
          <h1 className="text-5xl font-extrabold tracking-tighter leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl">
            Virtual DOM into the future.
          </h1>
          <p className="max-w-lg mt-6 text-2xl leading-tight text-gray-300 sm:max-w-2xl sm:text-2xl md:text-2xl lg:text-2xl">
            Million is a lightweight{' '}
            <code className="bg-blackish border-gray-800 border shadow-sm rounded-lg p-1">
              &lt;1kb
            </code>{' '}
            Virtual DOM. It's fast!
          </p>
          <div className="max-w-xl mt-5 lg:flex lg:mt-8">
            <div className="rounded-md">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center w-full px-6 py-3 text-md text-white no-underline border border-transparent rounded-md bg-blackish md:py-3 md:text-lg md:px-10 md:leading-6 font-bold hover:bg-black"
              >
                <PlayIcon className="w-5" />
                Watch Video
              </button>
            </div>
            <div className="relative mt-3 rounded-md lg:mt-0 lg:ml-3">
              <Link href="/docs/start-here">
                <a className="flex items-center justify-center w-full px-6 py-3 text-md font-medium text-black no-underline bg-gray-200 hover:bg-gray-300 border border-transparent rounded-md md:py-3 md:text-lg md:px-10 md:leading-6">
                  Get started →
                </a>
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-xl lg:mt-0 mt-10">
          <Tilt
            className="Tilt pb-0 mb-0 mt-0"
            options={{ max: 15, scale: 1, speed: 100 }}
          >
            <img src="/graph.svg" width="100%" />
          </Tilt>
          <p className="text-sm text-gray-400">
            Source:{' '}
            <Link href="/benchmarks">
              millionjs.org/benchmarks
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark border-t-[0.2rem] border-gray-150 dark:border-gray-900 border-solid px-4 py-16 sm:px-6 sm:pt-20 sm:pb-24 lg:pt-24">
        <div className="mx-auto lg:max-w-7xl">
          <p className="text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl lg:text-center dark:text-white text-center">
            Why Million?
          </p>
          <p className="mx-auto mt-4 text-xl text-gray-500 lg:max-w-3xl lg:text-xl text-center">
            Million is designed to be <b>modern and easy</b> to use while being{' '}
            <b>lean and insanely performant</b>.
          </p>
          <div className="grid grid-cols-1 mt-12 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {features.map((feature) => (
              <div
                className="p-9 w-auto bg-gray-100 border-gray-200 dark:bg-gray-900 dark:border-gray-800 border shadow-sm rounded-xl"
                key={feature.name}
              >
                <div>
                  <feature.icon
                    className="h-9 w-9 rounded-full p-1.5 bg-gradient-to-r from-color1 to-color0 bg-opacity-50 text-white dark:text-black"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="text-md font-medium text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Container>
          <div className="max-w-sm py-16 mx-auto mt-10 sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto ">
              <Link href="/docs/start-here">
                <a className="flex items-center justify-center w-full px-8 py-3 text-md font-medium text-white no-underline bg-black dark:bg-white border border-transparent rounded-md dark:text-black betterhover:dark:hover:bg-gray-300 betterhover:hover:bg-gray-700 md:py-3 md:text-lg md:px-10 md:leading-6">
                  Get Started →
                </a>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
