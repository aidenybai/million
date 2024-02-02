import Link from 'next/link';
import { useTranslations } from '../../hooks/use-translations';
import { Container } from './container';
import { Blur } from './hero';
import { ShimmerButton } from './shimmer-button';

export function CTA() {
  const { cta } = useTranslations();

  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative">
          <div className="mt-48 m-auto space-y-6 md:w-8/12 lg:w-7/12">
            <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
              {cta.getStartedInSeconds}
            </h1>
            <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300 md:text-md lg:text-lg">
              {cta.welcome}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/docs/introduction" className="h-12 w-fullsm:w-max">
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    {cta.getStarted}
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
