import { Link } from 'nextra-theme-docs';
import Image from 'next/image';
import { Container } from '../home/container';
import { ShimmerButton } from '../home/shimmer-button';

export function Hero() {
  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative pt-16 md:pt-28 ml-auto">
          <div className="lg:w-[70%] text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
              Your Personal{' '}
              <span className="gradient-text inline-block">
                Performance Expert.
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
              Detect, diagnose, and fix slow components in your React
              application <span className="font-  ">– automatically</span>.
              Designed for companies that want to ship fast and stay fast.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <div className="w-full sm:w-max">
                <Link
                  href="https://forms.gle/iDNwZQp96rQAjT4w5"
                  className="w-full sm:w-max no-underline"
                >
                  <ShimmerButton
                    className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                    background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                  >
                    <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                      Join Waitlist
                    </span>
                  </ShimmerButton>
                </Link>
              </div>
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
      <div className="fix-safari-blur blur-[170px] opacity-40 h-100 bg-gradient-to-br from-violet-500 to-purple-400 dark:from-indigo-700"></div>
      <div className="fix-safari-blur blur-[170px] opacity-40 h-100 bg-gradient-to-r from-pink-400 to-purple-300 dark:to-indigo-600"></div>
    </div>
  );
}
