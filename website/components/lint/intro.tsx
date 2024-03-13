import { domAnimation, LazyMotion, m } from 'framer-motion';
import LeftLine from './left';
import RightLine from './right';
import { useState } from 'react';
import Link from 'next/link';
import { BorderBeam } from './border-beam';
import ReactPlayer from 'react-player';
import { Blur } from '../home/hero';

export const leftSvgInfo = [
  {
    d: 'M766 115L453.617 115C446.29 115 439.104 112.987 432.842 109.182L353.267 60.8181C347.006 57.0126 339.819 55 332.492 55L-4.93638e-06 55',
    stops: [
      <stop key={1} stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.333349" stopColor="#7a44f7" />,
      <stop key={3} offset="0.770833" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M766 175L470.071 175C462.744 175 455.557 177.013 449.296 180.818L369.721 229.182C363.459 232.987 356.273 235 348.946 235L0 235',
    stops: [
      <stop key={1} offset="0.125" stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.421875" stopColor="#7a44f7" />,
      <stop key={3} offset="0.833333" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M765.863 229.001L506.593 229.001C499.107 229.001 491.772 231.101 485.421 235.063L408.679 282.938C402.328 286.9 394.993 289 387.507 289L0 289',
    stops: [
      <stop key={1} stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.496998" stopColor="#7a44f7" />,
      <stop key={3} offset="1" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M766 61L499.55 61C492.18 61 484.953 58.9637 478.667 55.1158L399.873 6.88415C393.587 3.0363 386.36 1.00001 378.99 1.00001L-4.93638e-06 1.00002',
    stops: [
      <stop key={1} stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.496998" stopColor="#7a44f7" />,
      <stop key={3} offset="1" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
];

export const rightSvgInfo = [
  {
    d: 'M0 61L257.585 61C265.068 61 272.401 58.9007 278.751 54.9408L355.53 7.05916C361.88 3.09925 369.214 1.00001 376.697 1.00001L759 1',
    stops: [
      <stop key={1} stopColor="#4e56da" stopOpacity="0" />,
      <stop key={2} offset="-1" stopColor="#7a44f7" />,
      <stop key={3} offset="0.639849" stopColor="#4e56da" stopOpacity="0" />,
      <stop key={4} offset="1" stopColor="#4e56da" stopOpacity="0" />,
    ],
  },
  {
    d: 'M0 133L314.772 133C322.154 133 329.393 130.957 335.686 127.097L414.257 78.9032C420.55 75.0431 427.788 73 435.171 73L759 73',
    stops: [
      <stop key={1} offset="0.316148" stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.558819" stopColor="#7a44f7" />,
      <stop key={3} offset="0.94364" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M-4.93638e-06 151L325.641 151C333.023 151 340.262 153.043 346.555 156.903L425.125 205.097C431.418 208.957 438.657 211 446.04 211L759 211',
    stops: [
      <stop key={1} stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.333349" stopColor="#7a44f7" />,
      <stop key={3} offset="0.639849" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M-4.93638e-06 199L283.251 199C290.648 199 297.9 201.051 304.202 204.925L382.513 253.075C388.814 256.949 396.066 259 403.463 259L759 259',
    stops: [
      <stop key={1} stopColor="#b073d8" stopOpacity="0" />,
      <stop key={2} offset="0.496998" stopColor="#7a44f7" />,
      <stop key={3} offset="1" stopColor="#b073d8" stopOpacity="0" />,
    ],
  },
  {
    d: 'M-4.9363e-06 235.001L257.489 235.001C264.974 235.001 272.309 237.101 278.66 241.063L355.403 288.938C361.754 292.9 369.089 295 376.574 295L758.738 295',
    stops: [
      <stop key={1} offset="0.316148" stopColor="#4e56da" stopOpacity="0" />,
      <stop key={2} offset="0.558819" stopColor="#7a44f7" />,
      <stop key={3} offset="0.94364" stopColor="#4e56da" stopOpacity="0" />,
    ],
  },
];

const LinesGenerator = ({
  svgInfo,
  dir,
}: {
  svgInfo: {
    d: string;
    stops: JSX.Element[];
  }[];
  dir: 'left' | 'right';
}) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.svg width="100%" height="100%" viewBox="0 0 766 290" fill="none">
        {dir === 'left'
          ? svgInfo.map((svgInfo, i) => {
              return (
                <LeftLine
                  key={i}
                  delay={i * 1}
                  d={svgInfo.d}
                  stops={svgInfo.stops}
                  id={`leftPaint${i}`}
                />
              );
            })
          : svgInfo.map((svgInfo, i) => {
              return (
                <RightLine
                  key={i}
                  delay={i * 1}
                  d={svgInfo.d}
                  stops={svgInfo.stops}
                  id={`rightPaint${i}`}
                />
              );
            })}
      </m.svg>
    </LazyMotion>
  );
};

export default function Intro(props: React.HTMLAttributes<HTMLDivElement>) {
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleClickWizard = () => {
    void navigator.clipboard.writeText('npx @million/lint@latest');
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 1000);
  };
  return (
    <article className="flex w-full flex-col items-center justify-center gap-16 border-0 border-solid px-1 pt-2 md:px-16 lg:pt-8">
      <div className="relative flex h-fit w-full flex-row items-start justify-center gap-0">
        <div className="absolute left-[-10%] top-[50%] z-[1] h-[400px] w-[600px] -translate-y-1/2">
          <LinesGenerator svgInfo={leftSvgInfo} dir="left" />
        </div>
        <div
          className="z-[2] flex w-[740px] flex-col items-center gap-[24px] px-8 py-0"
          style={{
            background:
              'radial-gradient(rgb(16, 16, 16) 40%, rgb(16, 16, 16) 50%, rgba(16, 16, 16, 0.6) 64%, rgba(16, 16, 16, 0) 70%, rgba(16, 16, 16, 0) 80%)',
          }}
        >
          <h1 className="px-[24px] text-center text-5xl font-semibold not-italic leading-[3.3rem] tracking-[-0.16rem] sm:px-0 sm:text-[4rem] sm:leading-[4.3rem]">
            you write code
            <br />
            <span className="text-[#af72d8]">
              we make it <span className="gradient-text">fast</span>
            </span>
          </h1>
          <h5 className="max-w-[450px] text-center text-[#D9D9D9]">
            Million Lint is a IDE extension that helps you identify and fix slow
            React components <i>(public beta)</i>
          </h5>

          <Link href="/blog/lint" target="_blank">
            <button className="clickable flex items-center justify-center gap-1 rounded-xl border border-solid border-[color:rgba(255,255,255,0.10)] bg-[#af72d8]/80 px-[14px] py-[8px] text-sm font-[500] text-white !transition-transform hover:scale-105">
              <span className="pr-1">Read our annoucement →</span>
            </button>
          </Link>
          <button
            className="flex flex-row items-center gap-2 mx-auto rounded-lg group"
            onClick={handleClickWizard}
          >
            <p className="text-sm text-zinc-100 dark:text-zinc-400 font-mono">
              ~ npx @million/lint@latest
            </p>
            <div className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 dark:text-zinc-300 transition-opacity">
              {submitted ? (
                <svg
                  className="w-[16px] h-[16px] dark:text-zinc-100 pt-[1px]"
                  data-testid="geist-icon"
                  fill="none"
                  height={24}
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width={24}
                  data-open="false"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  className="w-[16px] h-[16px] dark:text-zinc-100 pt-[1px]"
                  data-testid="geist-icon"
                  fill="none"
                  height={24}
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width={24}
                  data-open="true"
                >
                  <path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z" />
                </svg>
              )}
            </div>
          </button>
        </div>
        <div className="absolute left-auto right-[-10%] top-[50%] z-[1] h-[400px] w-[600px] -translate-y-1/2">
          <LinesGenerator svgInfo={rightSvgInfo} dir="right" />
        </div>
      </div>
      <div className="relative rounded h-full overflow-hidden sm:w-4/5">
        <ReactPlayer
          url="/lint/demo.mp4"
          controls
          playing
          muted={true}
          width="100%"
          height="100%"
          loop
        />

        <BorderBeam
          className="pointer-events-none"
          duration={10}
          size={250}
          colorFrom="#af72d8"
          colorTo="#855ce6"
        />
      </div>
    </article>
  );
}
