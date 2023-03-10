import Link from 'next/link';
import { useState } from 'react';
import CountUp from 'react-countup';
import Tilt from 'react-parallax-tilt';
import { Chart } from './chart';

export function Home() {
  const [checked, setChecked] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const pkgManagers = ['npm', 'pnpm', 'yarn'];
  const command = pkgManagers[count % 3] as string;
  return (
    <>
      <div
        id="hero"
        className="flex w-full h-[75vh] flex-row items-center justify-center px-[2rem] md:px-[2rem] xl:px-[7rem] pt-[5rem] pb-[5rem] md:pt-[6rem] md:pb-[8rem]"
      >
        <main className="!max-w-[1500px] mx-auto my-0 flex w-full flex-col items-center gap-20 md:max-w-screen-sm lg:max-w-[var(--max-width)] lg:flex-row lg:justify-between">
          <div className="flex-1 lg:max-w-[700px] mx-auto">
            <h1 className="mt-0 text-[26pt] font-extrabold leading-none dark:text-gray-50 md:text-[32pt] lg:text-[38pt] xl:text-[40pt]">
              Up to{' '}
              <span className="gradient-text inline-block">
                <span className="font-mono">
                  <CountUp useEasing end={70} duration={5} />
                </span>
                % faster*
              </span>
              <br />
              React components.
            </h1>
            <div className="h-8"></div>
            <p className="text-[1.3rem] leading-normal dark:text-gray-300">
              Harness the speed of Million.js to build blazing fast components -
              all using React. Million.js is a low level virtual DOM library
              with optimization utilites to make rendering faster!
            </p>
            <div className="rounded-[5px] mt-8 w-full">
              <div className="flex gap-3">
                <div className="flex items-center justify-center my-[10px] py-[14px] px-[20px] text-lg font-medium text-white dark:text-black no-underline bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300 border border-transparent rounded-md shadow">
                  <Link href="/docs">Get Started →</Link>
                </div>
                <div className="shadow hidden md:flex gap-2 rounded-lg my-[10px] border-2 border-[#b073d9] py-[12px] px-[20px] bg-[#e9e6f4] dark:bg-[#231f31]">
                  <span className="font-mono text-lg font-medium">
                    <span
                      onClick={() => setCount(count + 1)}
                      className="font-bold"
                    >
                      {command}
                    </span>{' '}
                    install million
                  </span>
                  <div
                    className="ml-auto"
                    onClick={() => {
                      setChecked(true);

                      void navigator.clipboard.writeText(
                        `${command} i million`,
                      );

                      setTimeout(() => {
                        setChecked(false);
                      }, 500);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      className={`cursor-pointer opacity-70 hover:opacity-100 p-0 w-7 h-7 ${
                        checked ? 'hidden' : ''
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className={`p-0 w-7 h-7 ${
                        checked ? 'animate-pulse animate-once' : 'hidden'
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="hidden text-small whitespace-nowrap pt-[3px] text-[0.9rem] text-gray-500 opacity-70 md:flex md:flex-row md:flex-wrap md:justify-between">
                <p className="text-[0.9rem] text-gray-500 dark:text-gray-300">
                  <span className="font-bold">*</span>comparison between virtual
                  DOM and relative frameworks. <br />
                  <span className="font-bold">PR currently pending</span>,{' '}
                  <a
                    href="https://github.com/aidenybai/js-framework-benchmark"
                    className="underline"
                    target="_blank"
                  >
                    view benchmark fork
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="h-8 lg:hidden"></div>
          </div>
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={10}
            glareEnable
            tiltAngleYInitial={5}
            glareMaxOpacity={0.1}
            className="hidden shadow-lg md:block w-full lg:!max-w-[400px] xl:!max-w-[550px] xl:mx-auto !text-md
          bg-[#ffffff] dark:bg-[#282b34] border border-[#e3e7f1] dark:border-[#343842] p-5 rounded-lg text-center"
          >
            <div className="w-full">
              <p className="font-mono font-bold">JS Framework Benchmark</p>
              <p className="text-xs mt-1 text-gray-400">
                Geometric mean of all benchmarks (higher is better)
              </p>
              <Chart />
            </div>
            <p className="text-xs text-gray-400">
              Based on JS Framework Benchmark data •{' '}
              <a
                href="https://krausest.github.io/js-framework-benchmark/"
                target="_blank"
                rel="noreferrer"
                className="text-[#b073d9] underline decoration-from-font [text-underline-position:from-font]"
              >
                View the full benchmark
              </a>
            </p>
          </Tilt>
        </main>
      </div>
    </>
  );
}
