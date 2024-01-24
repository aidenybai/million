// import '../../styles/wrapper.css';
import Link from 'next/link';
import { About } from '../../components/home/about';
import { CTA } from '../../components/home/cta';
import { Blur, Companies, Hero } from '../../components/home/hero';
import { Container } from '../../components/home/container';
import { ShimmerButton } from '../../components/home/shimmer-button';
import { RetroGrid } from '../../components/retro-grid';
import Tilt from 'react-parallax-tilt';
import CountUp from 'react-countup';
import { useRouter } from 'next/router';
import { useMockProgress } from 'mock-progress-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { BasicEvaluatedExpression } from 'next/dist/compiled/webpack/webpack';
import Head from 'next/head';

export default function Wrapped(props) {
  const { progress, finish, start } = useMockProgress({ timeInterval: 1000 });
  const id = props.id;
  const videoUrl = `https://telemetry.million.dev/api/v1/wrapped/${id}.mp4`;
  useEffect(start, []);
  // start();

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
                tiltMaxAngleX={5}
                tiltMaxAngleY={10}
                glareEnable
                tiltAngleYInitial={0}
                glareMaxOpacity={0.1}
                className="fix-safari-tilt shadow-lg w-full
rounded-lg text-center bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-700 dark:via-zinc-800 dark:to-darker p-px"
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

              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                  onClick={async () => {
                    (await navigator.clipboard.read()).forEach(async (m) => {
                      const blob = await m.getType('text/plain');
                      console.log(blob);
                      console.log(await blob.text());
                      console.log(await blob.arrayBuffer());
                    });
                    const vid = await fetch(videoUrl);
                    const blob = await vid.blob();

                    var a = new FileReader();
                    a.onload = async function (e) {
                      const str: string = e.target.result;

                      // console.log(e.target.result);
                      await navigator.clipboard.write([
                        new ClipboardItem({
                          ['text/plain']: new Blob([str], {
                            type: 'text/plain',
                          }),
                        }),
                      ]);
                    };
                    a.readAsDataURL(blob);
                  }}
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    Share on X
                  </span>
                </ShimmerButton>
                <button
                  onClick={() => window.open(videoUrl, '_blank')}
                  className="pointer-click relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
                >
                  <span className="relative text-base font-semibold text-purple-600 dark:text-white">
                    Download
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
