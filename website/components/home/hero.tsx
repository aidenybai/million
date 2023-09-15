import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import TextsLogo from '../../public/texts.webp';
import HackClubLogo from '../../public/hackclub.svg';
import OpenSaucedLogo from '../../public/opensauced.svg';
import { Container } from './container';
import { ShimmerButton } from './shimmer-button';

const CountUp = dynamic(() => import('react-countup'), {
  loading: () => <span>70</span>,
  ssr: false,
});

export function Hero() {
  return (
    <div className="relative">
      <Blur />
      <Container>
        <div className="relative pt-20 md:pt-36 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto">
            <h1 className="text-zinc-900 dark:text-white font-extrabold text-5xl md:text-6xl xl:text-7xl">
              Make React{' '}
              <span className="gradient-text inline-block">
                <CountUp start={10} end={70} useEasing />% faster
              </span>
            </h1>
            <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-300 leading-8">
              The{' '}
              <span className="font-medium dark:text-zinc-100">
                Virtual DOM Replacement
              </span>{' '}
              for React. Gain big performance wins for UI and data heavy React
              apps. Dead simple to use – try it out with{' '}
              <Link href="/docs" className="font-medium hover:underline">
                just one plugin
              </Link>
              .
            </p>
            <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <Link href="/docs" className="w-full sm:w-max">
                <ShimmerButton
                  className="relative w-full sm:w-max flex items-center justify-center transition-all hover:shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset]"
                  background="radial-gradient(ellipse 80% 70% at 50% 120%, #b28ce2, #892fda)"
                >
                  <span className="relative whitespace-pre text-center text-base font-semibold leading-none tracking-tight text-white z-10">
                    Get started →
                  </span>
                </ShimmerButton>
              </Link>
              <Link
                href="/blog/virtual-dom"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-purple-600/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-zinc-700 dark:before:bg-zinc-800 sm:w-max"
              >
                <span className="relative text-base font-semibold text-purple-600 dark:text-white">
                  How?
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="lg:w-2/3 text-center mx-auto">
          <Companies />
        </div>
      </Container>
    </div>
  );
}

export function Blur() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 pointer-events-none"
    >
      <div className="fix-safari-blur blur-[106px] h-56 bg-gradient-to-br from-violet-500 to-purple-400 dark:from-fuchsia-700"></div>
      <div className="fix-safari-blur blur-[106px] h-32 bg-gradient-to-r from-fuchsia-400 to-purple-300 dark:to-violet-600"></div>
    </div>
  );
}

export function Companies() {
  const entries = [
    {
      url: 'https://wyze.com',
      component: <WyzeLogo />,
    },
    {
      url: 'https://dona.ai',
      component: (
        <svg
          className="Logo__SVG-sc-1ajhv4q-0 iKWmkB Header__StyledLogo-sc-1it6zem-2 OPube dark:invert"
          height="28px"
          width="95.2px"
          viewBox="0 0 102 30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47.3223 24.2158C49.29 24.2158 50.8389 23.2129 51.5752 21.7021H51.626V24H54.7236V5.68066H51.5625V12.8027H51.4863C50.7754 11.3174 49.252 10.3145 47.3223 10.3145C43.9326 10.3145 41.7363 13.0059 41.7363 17.2588C41.7363 21.5371 43.9326 24.2158 47.3223 24.2158ZM48.2744 12.917C50.2676 12.917 51.5752 14.6309 51.5752 17.2715C51.5752 19.9375 50.2676 21.626 48.2744 21.626C46.2305 21.626 44.9736 19.9502 44.9736 17.2715C44.9736 14.6055 46.2432 12.917 48.2744 12.917ZM63.3311 24.2666C67.2793 24.2666 69.8438 21.6387 69.8438 17.2715C69.8438 12.917 67.2539 10.2637 63.3311 10.2637C59.4082 10.2637 56.8184 12.9297 56.8184 17.2715C56.8184 21.6387 59.3828 24.2666 63.3311 24.2666ZM63.3311 21.7656C61.3252 21.7656 60.0303 20.1406 60.0303 17.2715C60.0303 14.415 61.3379 12.7773 63.3311 12.7773C65.3369 12.7773 66.6318 14.415 66.6318 17.2715C66.6318 20.1406 65.3369 21.7656 63.3311 21.7656ZM71.875 24H75.0361V16.2051C75.0361 14.2754 76.1914 12.9678 78.0068 12.9678C79.8096 12.9678 80.6982 14.0342 80.6982 15.9385V24H83.8594V15.3037C83.8594 12.1934 82.1709 10.2891 79.2002 10.2891C77.1309 10.2891 75.6963 11.2539 74.9727 12.8535H74.9092V10.543H71.875V24ZM91.3115 21.8291C89.9404 21.8291 89.0264 21.1309 89.0264 20.0264C89.0264 18.96 89.9023 18.2744 91.4258 18.1729L94.5361 17.9824V19.0107C94.5361 20.6357 93.1016 21.8291 91.3115 21.8291ZM90.3594 24.2158C92.0859 24.2158 93.7744 23.3145 94.5488 21.8545H94.6123V24H97.6592V14.7324C97.6592 12.0283 95.4883 10.2637 92.1494 10.2637C88.7217 10.2637 86.5762 12.0664 86.4365 14.5801H89.3691C89.5723 13.4629 90.5244 12.7393 92.0225 12.7393C93.584 12.7393 94.5361 13.5518 94.5361 14.9609V15.9258L90.9814 16.1289C87.7061 16.332 85.8652 17.7666 85.8652 20.1533C85.8652 22.5781 87.7568 24.2158 90.3594 24.2158Z"
            className="Logo__Name-sc-1ajhv4q-1 iVHPNz"
          ></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.7551 3.06122H12.2449C7.1729 3.06122 3.06122 7.1729 3.06122 12.2449V17.7551C3.06122 22.8271 7.1729 26.9388 12.2449 26.9388H17.7551C22.8271 26.9388 26.9388 22.8271 26.9388 17.7551V12.2449C26.9388 7.1729 22.8271 3.06122 17.7551 3.06122ZM12.2449 0C5.48223 0 0 5.48223 0 12.2449V17.7551C0 24.5178 5.48223 30 12.2449 30H17.7551C24.5178 30 30 24.5178 30 17.7551V12.2449C30 5.48223 24.5178 0 17.7551 0H12.2449Z"
            className="Logo__Shape-sc-1ajhv4q-2 yeazD"
          ></path>
        </svg>
      ),
    },
    // {
    //   url: 'https://metamask.io',
    //   component: (
    //     <div className="flex items-center gap-3 text-xl font-semibold">
    //       <Image
    //         src={MetamaskLogo as string}
    //         width={30}
    //         height={30}
    //         alt="Metamask"
    //       />{' '}
    //       METAMASK
    //     </div>
    //   ),
    // },
    {
      url: 'https://hackclub.com',
      component: (
        <Image
          src={HackClubLogo as string}
          width={90}
          height={30}
          alt="Hack Club"
        />
      ),
    },
    {
      url: 'https://texts.com',
      component: (
        <div className="flex items-center gap-3 text-xl font-semibold">
          <Image src={TextsLogo} width={30} height={30} alt="Texts" /> Texts
        </div>
      ),
    },
    {
      url: 'https://opensauced.pizza/',
      component: (
        <Image
          src={OpenSaucedLogo as string}
          width={150}
          height={25}
          className="invert dark:invert-0"
          alt="OpenSauced"
        />
      ),
    },
  ];

  return (
    <div className="mt-36 text-center lg:mt-32">
      <div className="uppercase text-sm font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
        Trusted by companies who ship to{' '}
        <span className="dark:text-white text-black semibold">3M+</span> users
      </div>
      <div className="slider">
        <div className="slide-track-5 hover:pause mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-around items-center">
          {[...entries, ...entries].map(({ component, url }) => (
            <div className="w-[12rem] relative grayscale opacity-60 hover:opacity-100 transition duration-200 hover:grayscale-0">
              <a
                href={url}
                target="_blank"
                className="flex justify-center w-full"
              >
                {component}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WyzeLogo() {
  return (
    <svg
      width="100"
      height="23"
      viewBox="0 0 96 21"
      fill="none"
      className="invert dark:invert-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Wyze</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.7772 0.191406H10.8936L14.7772 8.03827L11.379 14.8466L4.09734 0.191406H0.213745L10.1655 20.3855H12.5927L16.719 12.0771L20.8453 20.3855H23.2726L33.2243 0.191406H29.3407L22.0589 14.962L14.7772 0.191406Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M51.671 0.191406L44.9961 10.3461L38.3212 0.191406H34.1949L43.297 13.9234V20.2701H46.8166V13.9234L55.7973 0.191406H51.671Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 20.3854H95.9683V16.9236H77.5212V20.3854Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 3.65326H95.9683V0.191406H77.5212V3.65326Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.5212 11.9619H95.9683V8.5H77.5212V11.9619Z"
        fill="white"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M56.8897 0.191406V3.53786H69.0259L55.4333 20.3855H75.2154V17.0391H62.7151L76.4289 0.191406H56.8897Z"
        fill="white"
      ></path>
    </svg>
  );
}
