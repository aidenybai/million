import Tilt from 'react-parallax-tilt';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from '../../hooks/use-translations';
import { Container } from './container';
import { Blur } from './hero';

const Chart = dynamic(() => import('../chart').then((mod) => mod.Chart));
const Showdown = dynamic(() =>
  import('../extra-content').then((mod) => mod.Showdown),
);

export function About() {
  const { about } = useTranslations();
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
                {about.rawJs}
              </h2>
              <p className="text-lg my-8 text-zinc-600 dark:text-zinc-300">
                {about.rawJsDescription}{' '}
                <a
                  href="https://krausest.github.io/js-framework-benchmark/2023/table_chrome_112.0.5615.49.html"
                  target="_blank"
                  rel="noreferrer"
                  className="nx-text-primary-600 underline decoration-from-font [text-underline-position:from-font]"
                >
                  {about.jsBenchmark}
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
                      {about.seventyPercent}
                    </h4>
                    <p className="text-zinc-500 text-sm dark:text-zinc-400">
                      {about.benchmarkWarning}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex gap-4 md:items-center">
                  <div className="w-12 h-12 flex gap-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <ClockIcon />
                  </div>
                  <div className="w-5/6">
                    <h4 className="font-semibold text-lg text-zinc-700 dark:text-purple-300">
                      {about.integrate}
                    </h4>
                    <p className="text-zinc-500 text-sm dark:text-zinc-400">
                      {about.noNeedLearn}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-10 text-xs bg-gradient-to-b dark:from-zinc-500 dark:to-[#111] dark:hover:to-zinc-500 inline-block text-transparent bg-clip-text from-zinc-500 to-white hover:to-zinc-500 opacity-40 hover:opacity-50 transition-opacity">
                {about.benchmarkNote}
              </p>
            </div>
          </div>
        </Container>
      </div>
      <div className="relative">
        <Container>
          <h3 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
            {about.whatsInMillionJS}
          </h3>
          <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300 md:text-md lg:text-lg">
            {about.toolsToMakeReactFaster}
          </p>
          <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title={about.blockVirtualDom}
              icon={<BoxIcon />}
              description={
                <>
                  {about.millionIntroduces}{' '}
                  <Link
                    href="/blog/virtual-dom"
                    className="underline nx-text-primary-600"
                  >
                    {about.blockVirtualDomQuote}
                  </Link>{' '}
                  {about.blockVirtualDomDescription}
                </>
              }
            />
            <Card
              title={about.superchargedCompiler}
              icon={<LightBulbIcon />}
              description={
                <>
                  {about.millionUses}{' '}
                  <Link
                    href="/blog/behind-the-block"
                    className="underline nx-text-primary-600"
                  >
                    {about.customCompiler}
                  </Link>{' '}
                  {about.automaticallyOptimizes}
                </>
              }
            />
            <Card
              title={about.automaticMode}
              icon={<ThumbsUpIcon />}
              description={
                <>
                  {about.tiredOf}{' '}
                  <Link
                    href="/docs/automatic"
                    className="underline nx-text-primary-600"
                  >
                    {about.dropIn}
                  </Link>{' '}
                  {about.makeReactFaster}
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
  const { about } = useTranslations();

  const handleClick = () => {
    setShowShowdown(!showShowdown);
  };

  return (
    <GraphicWrapper onClick={handleClick}>
      {!showShowdown ? (
        <div className="bg-white p-4 pb-6 dark:bg-zinc-900 rounded-lg">
          <div className="w-full">
            <p className="font-bold text-lg">{about.jsBenchmark}</p>
            <p className="text-md mt-1 text-zinc-700 dark:text-zinc-400">
              {about.higherBetter}
            </p>
            <Chart />
          </div>
          <div className="text-sm text-zinc-400">
            {about.basedOn}{' '}
            <a
              href="https://krausest.github.io/js-framework-benchmark/2023/table_chrome_112.0.5615.49.html"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 underline decoration-from-font [text-underline-position:from-font]"
            >
              {about.benchmarkData}
            </a>{' '}
            {about.chromeVersion}
          </div>
        </div>
      ) : (
        <Showdown initStart amount={500} />
      )}
    </GraphicWrapper>
  );
}

function GraphicWrapper({
  children,
  onClick,
}: {
  children: JSX.Element;
  onClick: () => void;
}) {
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

function Card({ title, description, icon }) {
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

function ThumbsUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-purple-500 hover:animate-spin"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
      />
    </svg>
  );
}

function LightBulbIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-purple-400 hover:animate-spin"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6 text-purple-400 hover:animate-spin"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-purple-400 m-auto hover:animate-spin"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 m-auto text-purple-600 dark:text-purple-400 hover:animate-spin"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
