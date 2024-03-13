import Link from 'next/link';
import ArticleWrapper from './article-wrapper';

export default function Join(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ArticleWrapper>
      <div className="flex flex-col items-center justify-center gap-[24px] overflow-hidden">
        <div className="flex max-w-[450px] flex-col items-center justify-center gap-[8px] text-center">
          <h3 className="pl-[0.2rem] text-[32px] leading-8 tracking-[-0.06rem] text-[#af72d8]">
            Million Lint
          </h3>

          <h2 className="text-5xl font-medium leading-[116.667%] tracking-[-1.92px]">
            Speed up your React site with Million Lint
          </h2>
          <h5 className="max-w-[450px] text-lg not-italic leading-[1.875rem] tracking-[-0.01125rem] text-[#A7A7A7]">
            Million Lint is in public beta. We have a lot of work to do. We
            would love your feedback to help us make the best possible web
            performance developer tool. Try it out, and let us know what you
            think!
          </h5>

          <Link href="/blog/lint">
            <button className="clickable mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-solid border-[color:rgba(255,255,255,0.10)] bg-[#af72d8]/80 px-[14px] py-[8px] text-sm font-[500] text-white !transition-transform hover:scale-105">
              <span className="pr-1">Read our annoucement →</span>
            </button>
          </Link>
        </div>
      </div>
    </ArticleWrapper>
  );
}
