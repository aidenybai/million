import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Wyze from '../../pages/showcase/wyze.png';
import HackClub from '../../pages/showcase/hackclub.jpeg';
import DonaAI from '../../pages/showcase/dona-ai.jpeg';
import LLMReport from '../../pages/showcase/llm-report.png';
import Texts from '../../pages/showcase/texts.png';
import { Container } from './container';

export function Community() {
  return (
    <>
      <div className="bg-black max-w-7xl w-[90%]  mx-auto p-6 lg:p-10 xl:p-6 rounded-2xl ">
        <div className="flex flex-col lg:flex-row gap-6 items-end justify-between overflow-hidden">
          <div className="py-5 pt-5 lg:pt-20 px-3 lg:w-[50%]">
            <h2 className="font-normal font-white text-4xl md:text-5xl xl:text-7xl pb-6 leading-6">
              Join our <br /> community
            </h2>
            <p className="font-medium pb-6 text-sm xl:text-base">
              Connect with 5000+ React developers committed to better performing
              applications. Connect, participate, and seek support — all on
              Discord.
            </p>

            <button className="py-2 px-4 xl:py-4 xl:px-6 bg-white text-blue-purple-gradient rounded-2xl hover:opacity-80">
              <a
                href="https://million.dev/chat"
                className="text-black font-semibold text-sm lg:text-base"
              >
                Join our Discord
              </a>
            </button>
          </div>

          <div className="w-full lg:w-[45%]">
            <ShowcaseSlider />

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
          </div>
        </div>
      </div>
    </>
  );
}

export const ShowcaseSlider = () => {
  const entries = [
    {
      image: Wyze,
      name: 'Wyze',
      url: 'wyze.com',
    },
    {
      image: HackClub,
      name: 'Hack Club',
      url: 'hackclub.com',
    },
    {
      image: DonaAI,
      name: 'Dona AI',
      url: 'dona.ai',
    },
    {
      image: LLMReport,
      name: 'LLM Report',
      url: 'llm.report',
    },
    {
      image: Texts,
      name: 'Texts',
      url: 'texts.com',
    },
  ];
  return (
    <div className="slider">
      <div className="slide-track-10 hover:pause mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
        {[...entries, ...entries, ...entries].map(({ image, name, url }, i) => (
          <a
            href={`https://${url}`}
            target="_blank"
            className="pr-10 space-y-6 text-center w-[24rem] relative grayscale-[50%] opacity-90 hover:opacity-100 transition duration-200 hover:grayscale-0"
          >
            <Image
              src={image}
              alt={name}
              width={256}
              height={288}
              className={`mx-auto h-32 w-72 md:h-40 md:w-24 lg:h-32 lg:w-72 rounded-lg object-cover object-top hover:rotate-0 ${
                i % 2 === 0 ? '-rotate-1' : 'rotate-1'
              } hover:scale-110 hover:shadow-lg lg:hover:shadow-2xl transition`}
            />
            <div>
              <h4 className="text-2xl text-gray-700 dark:text-white">{name}</h4>
              <span className="block text-sm text-gray-500">{url}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
