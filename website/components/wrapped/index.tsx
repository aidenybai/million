import { useMockProgress } from 'mock-progress-react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { Container } from '../home/container';
import { Blur } from '../home/hero';
import { RetroGrid } from '../retro-grid';

// eslint-disable-next-line import/no-default-export -- This is the default export
export default function Wrapped(props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { progress, finish, start } = useMockProgress({ timeInterval: 100 });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Not exactly unsafe, but we need to be careful
  const id = props.id as string;

  useEffect(() => {
    start();
    void fetch(`https://telemetry.million.dev/api/v1/wrapped/${id}.mp4`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ghello
        setVideoUrl(json.url as string);
        finish();
      });
  }, [id]);

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
      `,
          }}
        ></style>
      </Head>
      <div className="relativepb-10 border-b border-b-[#ffffff1a] h-screen">
        <Blur />
        <RetroGrid />
        <Container>
          <div className="relative pt-20 md:pt-12 ml-auto">
            <div className="lg:w-[70%] text-center mx-auto">
              <Tilt
                tiltMaxAngleX={2}
                tiltMaxAngleY={4}
                glareEnable
                tiltAngleYInitial={0}
                glareMaxOpacity={0.1}
                className="fix-safari-tilt shadow-lg w-full rounded-lg text-center bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-700 dark:via-zinc-800 dark:to-darker p-px"
              >
                {id && videoUrl.length > 0 ? (
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
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <progress
                    className="rounded-lg h-[420px] w-[100%] bg-transparent"
                    value={progress}
                    max={100}
                  ></progress>
                )}
                <div className="flex flex-col md:flex-row justify-center items-center divide-x divide-[#202025] border-top border-[#202025] rounded-bl-lg">
                  <button
                    className="relative w-full flex gap-1 items-center justify-center transition-all bg-black px-10 py-[11.5px] h-[64px] hover:bg-[#090909] "
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=My website is part ofI just wrapped my website with @milliondotjs and it's amazing! Check it out at https://million.dev/wrapped/${id}.mp4`,
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
                    <div className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                      Post
                    </div>
                  </button>
                  <button
                    className="relative w-full flex gap-1 items-center justify-center bg-black px-8 py-[11.5px] h-[64px] hover:bg-[#090909]"
                    onClick={() => {
                      // Copy to clipboard
                      void navigator.clipboard.writeText(
                        `https://million.dev/wrapped/${id}.mp4`,
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
                        <div className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                          Copied!
                        </div>
                      </>
                    ) : (
                      <>
                        <svg
                          className=" pt-[1px]"
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

                        <div className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                          Copy URL
                        </div>
                      </>
                    )}
                  </button>
                  <button
                    className="relative w-full flex gap-1 items-center justify-center bg-black px-8 py-[11.5px] h-[64px] hover:bg-[#090909] rounded-br-lg"
                    onClick={() => {
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

                    <div className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                      Download
                    </div>
                  </button>
                </div>
              </Tilt>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
