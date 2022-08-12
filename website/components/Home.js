import {
  AdjustmentsIcon,
  CodeIcon,
  CursorClickIcon,
  EyeIcon,
  LightningBoltIcon,
  PaperAirplaneIcon,
  PlayIcon,
} from '@heroicons/react/outline';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';
import Tilt from 'react-tilt';
import Container from './Container';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  indexAxis: 'y',
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Add 5000 nodes consecutively (lower is better)',
    },
  },
};

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

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Page() {
  const [isOpen, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [millionToast, setMillionToast] = useState(true);
  const [reactToast, setReactToast] = useState(true);

  const millionMs = 0.36;
  const reactMs = 4.01;

  const isMillionFinished = count > millionMs;
  const isReactFinished = count > reactMs;

  const data = [
    isMillionFinished ? millionMs : count,
    isReactFinished ? reactMs : count,
  ];

  const millionColor = {
    borderColor: '#e497ea',
    backgroundColor: '#f8a4ff',
  };

  const reactColor = {
    borderColor: '#53bcda',
    backgroundColor: '#61dafb',
  };

  const loadingColor = {
    borderColor: 'rgb(201, 203, 207)',
    backgroundColor: 'rgb(201, 203, 207, 0.2)',
  };

  const borderColor = [
    isMillionFinished ? millionColor.borderColor : loadingColor.borderColor,
    isReactFinished ? reactColor.borderColor : loadingColor.borderColor,
  ];

  const backgroundColor = [
    isMillionFinished
      ? millionColor.backgroundColor
      : loadingColor.backgroundColor,
    isReactFinished ? reactColor.backgroundColor : loadingColor.backgroundColor,
  ];

  useInterval(
    () => {
      setCount(count + 0.25);
    },
    isReactFinished && isMillionFinished ? null : 250,
  );

  if (isMillionFinished && millionToast) {
    setMillionToast(false);
    toast(`Million finished in ${millionMs}s`, {
      icon: '✅',
      style: {
        borderRadius: '10px',
        background: millionColor.backgroundColor,
        color: '#000',
        fontWeight: 'bold',
      },
    });
  }

  if (isReactFinished && reactToast) {
    setReactToast(false);
    toast(`React finished in ${reactMs}s`, {
      icon: '⚠️',
      style: {
        borderRadius: '10px',
        background: reactColor.backgroundColor,
        color: '#000',
        fontWeight: 'bold',
      },
    });
  }

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
      <div className="px-8 pt-32 pb-32 sm:px-6 lg:px-8 text-white bg-gradient-to-b from-blackish to-color2 animate-gradient-x bg-repeat flex justify-content">
        <div className="lg:max-w-7xl lg:flex lg:justify-content lg:gap-x-4 mx-auto">
          <div className="mx-auto max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tighter leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl">
              Virtual DOM into the future.
            </h1>
            <p className="max-w-lg mt-6 text-2xl leading-tight text-gray-300 sm:max-w-2xl sm:text-2xl md:text-2xl lg:text-2xl">
              Million drop-in replacement for React with a lightweight{' '}
              <code className="bg-blackish border-gray-800 border shadow-sm rounded-lg p-1">
                &lt;1kb
              </code>{' '}
              Virtual DOM.
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
          <div className="mx-auto max-w-xl lg:mt-0 mt-10 hidden md:block">
            <Tilt
              className="Tilt pb-0 mb-0 mt-0"
              options={{ max: 15, scale: 1.05 }}
            >
              <div className="bg-white p-4 shadow-lg shadow-slate-200 rounded-lg w-auto">
                <Bar
                  className="w-[30rem]"
                  options={options}
                  data={{
                    labels: ['Million', 'React'],
                    datasets: [
                      {
                        label: 'Scripting time (seconds)',
                        data,
                        borderColor,
                        backgroundColor,
                      },
                    ],
                  }}
                />
              </div>
            </Tilt>
            <p className="text-sm text-gray-400 text-center w-full">
              Source:{' '}
              <a
                className="text-gray-200"
                href="https://twitter.com/aidenybai/status/1553280656213360640"
              >
                "React now performs 11x faster with million.js.org!" @aidenybai
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark border-t-[0.2rem] border-gray-150 dark:border-gray-900 border-solid px-4 py-16 sm:px-6 sm:pt-20 sm:pb-24 lg:pt-24">
        <div className="mx-auto lg:max-w-7xl">
          <p className="text-2xl font-bold tracking-tight lg:text-3xl xl:text-4xl lg:text-center dark:text-white text-center">
            Why Million?
          </p>
          <p className="mx-auto mt-4 text-xl text-gray-400 lg:max-w-3xl lg:text-xl text-center">
            Million is designed to be modern and easy to use while being lean
            and insanely performant.
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
      <Toaster position="bottom-right" />
    </>
  );
}
