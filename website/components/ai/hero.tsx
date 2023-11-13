import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Container } from '../home/container';
import { ShimmerButton } from '../home/shimmer-button';

export function Hero() {
  const [isOn, setIsOn] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative pt-16 md:pt-28 ml-auto">
          <div className="lg:w-[70%] text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
              You write code.
              <br />
              <span className="gradient-text inline-block">
                We make it fast
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
              A GitHub bot to detect, diagnose, and fix slow components in your
              React application{' '}
              <span className="font-semibold">– automatically</span>. Designed
              for companies that want to ship fast and stay fast.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
              {!isOn ? (
                <ShimmerButton
                  onClick={() => setIsOn(true)}
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    Join waitlist →
                  </span>
                </ShimmerButton>
              ) : null}
              <div
                style={{ display: isOn ? 'block' : 'none' }}
                id="getWaitlistContainer"
                data-waitlist_id="11876"
                data-widget_type="WIDGET_2"
              ></div>
            </div>
          </div>
        </div>
        <div className="lg:w-2/3 text-center mx-auto">
          <Image alt="ai" width={1000} height={500} src="/ai.png" />
        </div>
      </Container>
      <Blur />
    </div>
  );
}

export function Blur() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-10 dark:opacity-20 pointer-events-none"
    >
      <div className="fix-safari-blur blur-[170px] opacity-20 h-100 bg-gradient-to-br from-violet-500 to-purple-400 dark:from-indigo-700"></div>
      <div className="fix-safari-blur blur-[170px] opacity-20 h-100 bg-gradient-to-r from-pink-400 to-purple-300 dark:to-indigo-600"></div>
    </div>
  );
}
