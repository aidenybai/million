export function Showcase() {
  return (
    <main className="relative">
      <div className="mx-auto">
        <div className="py-16 lg:text-center">
          <p className="text-base font-semibold leading-6 tracking-wide text-blue-600 uppercase dark:text-gray-400 font-space-grotesk">
            Showcase
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 md:text-5xl dark:text-white sm:text-4xl sm:leading-10">
            Who's using Million.js?
          </h1>
          <p className="max-w-3xl mt-4 text-xl leading-7 text-gray-500 dark:text-gray-400 lg:mx-auto font-space-grotesk">
            Million.js is a Virtual DOM Replacement for React. It makes React
            components up to 70% faster, and improves loading and rendering
            speeds.
          </p>
          <a
            href="https://github.com/aidenybai/million/network/dependents"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center w-auto px-8 py-3 text-base font-medium text-white no-underline bg-black border border-transparent rounded-md dark:bg-white dark:text-black betterhover:dark:hover:bg-gray-300 betterhover:hover:bg-gray-700 md:py-3 md:text-lg md:px-10 md:leading-6"
          >
            See All
          </a>
        </div>
      </div>
    </main>
  );
}
