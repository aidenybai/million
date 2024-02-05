import Head from 'next/head';
import { useEffect, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { Blur } from '../home/hero';
import { RetroGrid } from '../retro-grid';
import { useMockProgress } from './useMockProgress';
import { track } from '@vercel/analytics';

// eslint-disable-next-line import/no-default-export -- This is the default export
export default function Wrapped(props) {
  const [mode, setMode] = useState<'default' | 'customize'>('default');
  const [name, setName] = useState<string>('My React app');
  const [copied, setCopied] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { progress, finish, start } = useMockProgress({
    timeInterval: 2000,
    autoComplete: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Not exactly unsafe, but we need to be careful
  const id = (props.id as string).split('.')[0];

  useEffect(() => {
    const url = new URL(globalThis.window.location.href);
    if (url.searchParams.has('name')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- asd
      setName(url.searchParams.get('name')!);
    } else {
      setNameName('My React app');
    }
  }, []);

  const setNameName = (newName: string): void => {
    track('wrapped/set-name');
    setName(newName);
    const url = new URL(window.location.href);
    url.searchParams.set('name', newName);
    window.history.pushState(null, '', url.toString());
  };

  useEffect(() => {
    track('wrapped/generate-video');
    setVideoUrl('');
    start();
    const abortController = new AbortController();

    void fetch(
      `https://telemetry.million.dev/api/v1/wrapped/${id}.mp4${
        name && name.length > 0 ? `?name=${name}` : ''
      }`,
      {
        signal: abortController.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ghello
        setVideoUrl(json.url as string);
        finish();
      });
    return () => {
      abortController.abort();
    };
  }, [id, name]);

  return (
    <main className="space-y-40 -mb-8">
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
              progress[value]::-webkit-progress-value {
                background-image:
                   -webkit-linear-gradient(-45deg,
                                           transparent 33%, rgba(0, 0, 0, .1) 33%,
                                           rgba(0,0, 0, .1) 66%, transparent 66%),
                   -webkit-linear-gradient(top,
                                           rgba(255, 255, 255, .25),
                                           rgba(0, 0, 0, .25)),
                   -webkit-linear-gradient(left, #892fda, #a36bdf);

                  border-radius: 2px;
                  background-size: 400px 150px, 100% 100%, 100% 100%;
              }

              .james {
                background: radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda);
              }
              .james:hover {
                background: radial-gradient(ellipse 80% 70% at 50% 120%, #892fda, #b28ce2);
              }
      `,
          }}
        ></style>
      </Head>
      <div className="relative pb-10 border-b border-b-[#ffffff1a] h-screen md:flex md:align-center ">
        <Blur />
        <div className="opacity-20">
          <RetroGrid />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6 md:flex pt-40 md:pt-0">
          <div className="relative m-auto">
            <div className="lg:w-[90%] text-center mx-auto ">
              <Tilt
                gyroscope={true}
                tiltMaxAngleX={2}
                tiltMaxAngleY={4}
                glareEnable
                tiltAngleYInitial={0}
                glareMaxOpacity={0.1}
                className="fix-safari-tilt shadow-lg w-full rounded-lg text-center bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-700 dark:via-zinc-800 dark:to-darker p-px"
              >
                {id && videoUrl.length > 0 ? (
                  <video
                    className="rounded-t-lg"
                    crossOrigin="anonymous"
                    width="1280"
                    height="720"
                    muted={true}
                    autoPlay={true}
                    loop={true}
                    onPlay={finish}
                    onCanPlay={finish}
                  >
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <progress
                    className="rounded-lg mb-[-6px] w-full bg-transparent h-auto"
                    style={{ aspectRatio: '1280 / 720' }}
                    value={progress}
                    max={100}
                  ></progress>
                )}
                <div className="grid grid-rows-4 grid-cols-1 sm:grid-cols-4 sm:grid-rows-1 justify-center items-center divide-x divide-[#42424C] border-top border-[#202025]">
                  <button
                    className="relative w-full flex gap-2  items-center justify-center transition-all bg-black px-10 py-[11.5px] h-[64px] hover:bg-[#090909] md:rounded-bl-lg james"
                    onClick={() => {
                      setMode((prev) =>
                        prev === 'default' ? 'customize' : 'default',
                      );
                    }}
                  >
                    {mode === 'default' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9.53 16.122a3 3 0 0 0-5.78 1.128a2.25 2.25 0 0 1-2.4 2.245a4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128m0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.764m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                        />
                      </svg>
                    )}

                    <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                      {mode === 'default' ? 'Customize' : 'Back to Share'}
                    </div>
                  </button>

                  {mode === 'customize' && (
                    <div className="col-span-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const formData = new FormData(form);
                          const _name = formData.get('name') as string;
                          setNameName(_name);
                          setMode('default');
                        }}
                        className="flex flex-row divide-x divide-[#42424C]"
                      >
                        <input
                          name="name"
                          id="name"
                          type="text"
                          placeholder="Add your company name"
                          className="w-full h-[64px] px-4 text-lg font-semibold leading-none tracking-tight text-white bg-black"
                        ></input>
                        <button
                          className="relative w-full flex gap-1 items-center justify-center transition-all bg-black px-10 py-[11.5px] h-[64px] hover:bg-[#090909] rounded-br-lg w-[300px]"
                          type="submit"
                        >
                          <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                            Generate
                          </div>
                        </button>
                      </form>
                    </div>
                  )}

                  {mode === 'default' && (
                    <>
                      <button
                        className="relative w-full flex gap-1 items-center justify-center transition-all bg-black px-10 py-[11.5px] h-[64px] hover:bg-[#090909] "
                        onClick={() =>
                          window.open(
                            'https://twitter.com/intent/tweet?text=' +
                              encodeURIComponent(
                                `I just ran npx million@latest and it made my react app faster! Check it out at ${window.location.href} #millionwrapped`,
                              ),
                            '_blank',
                          )
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="feather feather-twitter pt-1"
                        >
                          <path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z"></path>
                        </svg>
                        <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                          Post
                        </div>
                      </button>
                      <button
                        className="relative w-full flex gap-1 items-center justify-center bg-black px-8 py-[11.5px] h-[64px] hover:bg-[#090909]  md:rounded-bl-none"
                        onClick={() => {
                          track('wrapped/copy-url');
                          // Copy current url to clipboard
                          void navigator.clipboard.writeText(
                            window.location.href,
                          );
                          setCopied(true);

                          setTimeout(() => {
                            setCopied(false);
                          }, 2000);
                        }}
                      >
                        {copied ? (
                          <>
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
                            <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                              Copied!
                            </div>
                          </>
                        ) : (
                          <>
                            <svg
                              className="pt-[1px]"
                              fill="none"
                              height={22}
                              shapeRendering="geometricPrecision"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                              width={22}
                              data-open="true"
                            >
                              <path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z" />
                            </svg>

                            <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                              Copy URL
                            </div>
                          </>
                        )}
                      </button>
                      <button
                        className="relative w-full flex gap-1 items-center justify-center bg-black px-8 py-[11.5px] h-[64px] hover:bg-[#090909] rounded-b-lg md:rounded-bl-none"
                        onClick={() => {
                          track('wrapped/download');
                          window.open(videoUrl, '_blank');
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>

                        <div className="relative whitespace-pre text-center text-lg font-semibold leading-none tracking-tight text-white z-10">
                          Download
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </Tilt>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function hash(str: string): number {
  let hashy = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hashy = (hashy << 5) - hashy + chr;
    hashy |= 0; // Convert to 32bit integer
  }
  return hashy;
}
