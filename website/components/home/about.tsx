import Tilt from 'react-parallax-tilt';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BoxIcon } from '@components/icons/box';
import { ClockIcon } from '@components/icons/clock';
import { LightBulbIcon } from '@components/icons/lightbulb';
import { LightningIcon } from '@components/icons/lightning';
import { ThumbsUpIcon } from '@components/icons/thumbsup';
import { Container } from './container';
import { Blur } from './blur';

const Chart = dynamic(() => import('../chart').then((mod) => mod.Chart));
const Showdown = dynamic(() =>
  import('../extra-content').then((mod) => mod.Showdown),
);

export function About() {
  return (
    <>
      <div>
        <Container>
          <div className="lg:p-4 space-y-6 md:flex md:gap-20 justify-center md:space-y-0 lg:items-center">
            <div className="md:w-7/12 lg:w-1/2">
              <Graphic />
            </div>
            <div className="md:w-7/12 lg:w-1/2">
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
                React at the speed of raw JS
              </h2>
              <p className="text-lg my-8 text-zinc-600 dark:text-zinc-300">
                Million.js automatically optimizes React, making it run way
                faster. It's one of the top performers in the{' '}
                <a
                  href="https://krausest.github.io/js-framework-benchmark/2023/table_chrome_112.0.5615.49.html"
                  target="_blank"
                  rel="noreferrer"
                  className="nx-text-primary-600 underline decoration-from-font [text-underline-position:from-font]"
                >
                  JS Framework Benchmark
                </a>
                .
              </p>
              <div className="divide-y space-y-4 divide-zinc-100 dark:divide-zinc-800">
                <div className="mt-8 flex gap-4 md:items-center">
                  <div className="w-12 h-12 flex gap-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <LightningIcon />
                  </div>
                  <div className="w-5/6">
                    <h4 className="font-semibold text-lg text-zinc-700 dark:text-purple-300">
                      Up to 70% faster* than React.
                    </h4>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      * - Benchmarks may not represent real-world performance.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex gap-4 md:items-center">
                  <div className="w-12 h-12 flex gap-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <ClockIcon />
                  </div>
                  <div className="w-5/6">
                    <h4 className="font-semibold text-lg text-zinc-700 dark:text-purple-300">
                      Integrate and ship in minutes.
                    </h4>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      No need to learn a new framework. Works with your existing
                      React components.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-xs bg-gradient-to-b dark:from-zinc-500 dark:to-[#111] dark:hover:to-zinc-500 inline-block text-transparent bg-clip-text from-zinc-500 to-white hover:to-zinc-500 opacity-40 hover:opacity-50 transition-opacity">
                Note: It's important to note that benchmarks (via JS Framework
                Benchmark) do not represent real-life performance. Million.js
                does include some limitations. You may see more performance
                improvement if you have more data / UI heavy apps.
              </div>
            </div>
          </div>
        </Container>
      </div>
      <div className="relative">
        <Container>
          <h3 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
            What's in Million.js?
          </h3>
          <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300 md:text-md lg:text-lg">
            All the tools to make React faster, automatically.
          </p>
          <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Block Virtual DOM"
              icon={<BoxIcon />}
              description={
                <>
                  Million.js introduces a novel{' '}
                  <Link
                    href="/blog/virtual-dom"
                    className="underline nx-text-primary-600"
                  >
                    "block" virtual DOM.
                  </Link>{' '}
                  It's significantly faster than React's virtual DOM, as it
                  diffs data instead of the DOM.
                </>
              }
            />
            <Card
              title="Supercharged Compiler"
              icon={<LightBulbIcon />}
              description={
                <>
                  Million.js uses a{' '}
                  <Link
                    href="/blog/behind-the-block"
                    className="underline nx-text-primary-600"
                  >
                    custom compiler
                  </Link>{' '}
                  that automatically optimizes your React components on the
                  server.
                </>
              }
            />
            <Card
              title="Automatic Mode"
              icon={<ThumbsUpIcon />}
              description={
                <>
                  Tired of learning new frameworks and big migrations?
                  Million.js ships{' '}
                  <Link
                    href="/docs/quickstart"
                    className="underline nx-text-primary-600"
                  >
                    a drop-in automatic mode
                  </Link>{' '}
                  to make your React apps faster, without any code changes.
                </>
              }
            />
          </div>
        </Container>
        <Blur />
      </div>
    </>
  );
}

function Graphic() {
  const [showShowdown, setShowShowdown] = useState(false);

  return (
    <GraphicWrapper onClick={() => setShowShowdown(!showShowdown)}>
      {!showShowdown ? (
        <div className="bg-white p-4 pb-6 dark:bg-zinc-900 rounded-lg">
          <div className="w-full">
            <p className="font-bold text-lg">JS Framework Benchmark</p>
            <p className="text-md mt-1 text-zinc-700 dark:text-zinc-400">
              Geometric mean of all benchmarks (higher is better)
            </p>
            <Chart />
          </div>
          <div className="text-sm text-zinc-400">
            Based on{' '}
            <a
              href="https://krausest.github.io/js-framework-benchmark/2023/table_chrome_112.0.5615.49.html"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 underline decoration-from-font [text-underline-position:from-font]"
            >
              JS Framework Benchmark data
            </a>{' '}
            (Chrome 102)
          </div>
        </div>
      ) : (
        <Showdown initStart amount={500} />
      )}
    </GraphicWrapper>
  );
}

interface GraphicWrapperProps {
  children: JSX.Element;
  onClick: () => void;
}

function GraphicWrapper({ children, onClick }: GraphicWrapperProps) {
  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={10}
      glareEnable
      tiltAngleYInitial={0}
      glareMaxOpacity={0.1}
      className="fix-safari-tilt shadow-lg w-full
rounded-lg text-center bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-700 dark:via-zinc-800 dark:to-darker p-px"
    >
      <div className="absolute z-50 flex p-2 justify-end w-full">
        <button onClick={onClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 absolute hover:animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 animate-ping text-purple-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>
      {children}
    </Tilt>
  );
}

interface CardProps {
  title: string;
  description: string | JSX.Element;
  icon: JSX.Element;
}

function Card({ title, description, icon }: CardProps) {
  return (
    <Tilt
      tiltMaxAngleX={2.5}
      tiltMaxAngleY={5}
      glareEnable
      tiltAngleYInitial={0}
      glareMaxOpacity={0.1}
      className="fix-safari-tilt relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-200 to-white p-px dark:from-zinc-700 dark:via-zinc-800 dark:to-darker"
    >
      <div className="relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900">
        {icon}
        <div>
          <h4 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {title}
          </h4>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
      </div>
    </Tilt>
  );
}
