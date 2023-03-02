import Link from 'next/link';

export function Home() {
  return (
    <div className="relative z-20 mx-auto flex max-w-7xl flex-col justify-between px-4">
      <div className="relative mx-auto flex max-w-3xl flex-col justify-center mt-32 mb-64">
        <div className="max-w-[725px] text-center">
          <h1 className="relative mb-8 text-[38px] leading-[46px] md:text-[70px] md:leading-[85px] tracking-[-1.024px;] text-slate-988 dark:text-slate-12 font-bold">
            Your React code made{' '}
            <span className="text-[#af72d7] font-extrabold italic">
              blazingly fast
            </span>
          </h1>
          <div className="sm:px-20">
            <span className="text-17px text-black/60 dark:!text-white/60  md:text-xl tracking-[-0.16px] text-slate-11 font-normal">
              The missing optimization utility in the React virtual DOM. With a
              drop of{' '}
              <code className="font-mono text-15px bg-gray-200 dark:bg-gray-800 rounded-lg">
                `optimize(Component)`
              </code>{' '}
              , you can make your React components up to{' '}
              <span className="font-bold text-black dark:text-white">
                70% faster
              </span>
              .
            </span>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            className="text-base h-11 px-4 rounded-md gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:outline-none focus:bg-black/90 dark:focus:bg-white/90 inline-flex items-center justify-center border font-medium"
            href="/docs"
          >
            I'm ready!
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
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </Link>
          <Link
            className="text-base h-11 px-4 rounded-md gap-2 border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:outline-none focus:bg-black/20 dark:focus:bg-white/20 inline-flex items-center justify-center border font-medium"
            href="https://www.youtube.com/watch?v=KgnSM9NbV2s"
          >
            Watch video
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
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
