import { useMockProgress } from 'mock-progress-react';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import { Container } from '../home/container';
import { Blur } from '../home/hero';
import { ShimmerButton } from '../home/shimmer-button';
import { RetroGrid } from '../retro-grid';

// eslint-disable-next-line import/no-default-export -- This is the default export
export default function Wrapped(props) {
  const { progress, finish, start } = useMockProgress({ timeInterval: 2000 });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Not exactly unsafe, but we need to be careful
  const id = props.id as string;
  const videoUrl = `https://telemetry.million.dev/api/v1/wrapped/${id}.mp4`;
  useEffect(start, []);

  return (
    <main className="space-y-40 mb-40">
      <Head>
        <style
          type="text/css"
          dangerouslySetInnerHTML={{
            __html: `
              .nextra-sidebar-container, .nextra-breadcrumb, .nextra-toc {
                display: none!important;
              }
              #__next > main > div > div:nth-child(5) {
                max-width: 100%!important;
              }
              article {
                max-width: 100%!important;
              }
              article > main {
                max-width: 100%!important;
                padding: 0!important;
              }
              #__next > main > div > div:nth-child(5) > article > main > :nth-child(3) {
                display: none!important;
              }
      `,
          }}
        ></style>
      </Head>
      <div className="relative pb-10 border-b border-b-[#ffffff1a]">
        <Blur />
        <RetroGrid className="opacity-20 " />
        <Container>
          <div className="relative pt-20 md:pt-36 ml-auto">
            <div className="lg:w-[70%] text-center mx-auto">
              <Tilt
                tiltMaxAngleX={2}
                tiltMaxAngleY={4}
                glareEnable
                tiltAngleYInitial={0}
                glareMaxOpacity={0.1}
                className="fix-safari-tilt shadow-lg w-full rounded-lg text-center bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-700 dark:via-zinc-800 dark:to-darker p-px"
              >
                <video
                  className="rounded-lg"
                  crossOrigin="anonymous"
                  width="1280"
                  height="720"
                  muted={true}
                  autoPlay={true}
                  loop={true}
                  onPlay={finish}
                  onCanPlay={finish}
                >
                  {id ? <source src={videoUrl} type="video/mp4" /> : null}
                </video>
              </Tilt>
              <h1 className="mt-8 text-zinc-900 dark:text-white font-extrabold text-5xl md:text-6xl xl:text-7xl">
                {progress === 100 ? (
                  <>
                    It's{' '}
                    <span className="gradient-text inline-block">Ready</span>{' '}
                  </>
                ) : (
                  <>
                    It's{' '}
                    <span className="gradient-text inline-block">
                      {progress}%
                    </span>{' '}
                    done
                  </>
                )}{' '}
              </h1>
              <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
                Ping{' '}
                <Link href="https://twitter.com/milliondotjs">
                  <span className="gradient-text inline-block">
                    @milliondotjs
                  </span>{' '}
                </Link>{' '}
                on{' '}
                <span className="font-medium dark:text-zinc-100">
                  X / Twitter
                </span>{' '}
                and share your gains! We'd love to quote you.
              </p>

              <div className="mt-8 flex flex-wrap justify-center items-center gap-y-4 gap-x-6">
              <button
                  className="relative w-full sm:w-max flex gap-1 items-center justify-center transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset] bg-black rounded-[100px] px-8 py-[11.5px] w-[165px] transition-all  hover:scale-105 duration-300"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just wrapped my website with Million.js and it's amazing! Check it out at https://million.dev/wrapped/${id}.mp4`, '_blank')}
                >
                <span className ="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">Share on</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="feather feather-twitter pt-1"
                >
                  <path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z"></path>
                </svg>
                </button>
              
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    Download Video
                  </span>
                </ShimmerButton>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
