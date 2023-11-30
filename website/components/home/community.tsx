import React from 'react';

export function Community() {
  return (
    <>
      <div className="bg-zinc-800 max-w-7xl w-[90%]  mx-auto p-6 lg:p-10 xl:p-6 rounded-2xl">
        <div className="flex flex-col gap-6">
          <aside className="font-semibold text-sm md:text-lg">Community</aside>
          <div>
            <h2 className="font-bold text-4xl md:text-6xl xl:text-7xl pb-6">
              Join our community
            </h2>
            <p className="font-medium pb-6 text-sm xl:text-base">
              Get support, get involved, and join our community of 5000+ React
              developers that care about performance—it all happens on Discord.
            </p>

            <button className="py-2 px-4 xl:py-4 xl:px-6 bg-white text-blue-purple-gradient rounded-2xl hover:opacity-80">
              <a
                href="https://million.dev/chat"
                className="text-black font-semibold text-sm lg:text-base"
              >
                Join our Discord
              </a>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
