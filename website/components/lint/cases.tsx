import ArticleWrapper from './article-wrapper';
import one from '../../public/lint/1.png';
import two from '../../public/lint/2.png';

export default function Platform(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ArticleWrapper>
      <div className="flex flex-col items-start justify-start gap-[24px]">
        <div className="flex max-w-[450px] flex-col items-start justify-start gap-[8px]">
          <h3 className="pl-[0.2rem] text-2xl font-medium not-italic leading-8 tracking-[-0.06rem] text-[#af72d8]">
            All-in-one React development tool
          </h3>

          <h2 className="max-w-[550px] text-5xl font-medium not-italic leading-[56px] tracking-[-1.92px]">
            Find and fix slow React components
          </h2>
          <h5 className="max-w-[450px] text-lg font-medium not-italic leading-[1.875rem] tracking-[-0.01125rem] text-[#c9c9c9]">
            Instead of dashboards and graphs, get real-time data in your IDE.
          </h5>
        </div>

        <div className="grid w-fit min-w-full grid-cols-1 items-center justify-center gap-8 md:grid-cols-2">
          <PlatformCard
            heading="Get render information right in your code"
            subheading="Also tracked: bundle sizes, network requests, hooks, props, and more!"
            art={one}
          />
          <PlatformCard
            heading="Use lint++ to help you fix slow code"
            subheading="Not sure how to optimize React components? Use lint++ to turn hours of debugging into minutes!"
            art={two}
          />
        </div>
      </div>
    </ArticleWrapper>
  );
}

interface PlatformCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  subheading: string;
  art: any;
}

export function PlatformCard(props: PlatformCardProps) {
  return (
    <div className="relative mx-auto my-0 flex w-full flex-col  justify-between gap-[16px] overflow-hidden rounded-2xl border border-solid border-[rgba(255,255,255,0.1)] px-6 py-8">
      <div className="flex w-full justify-between">
        <div className="-mt-3 flex max-w-[300px] flex-col justify-center gap-0">
          <h4 className="text-2xl font-medium leading-[133.333%] tracking-[-0.96px]">
            {props.heading}
          </h4>
          <h5 className="text-lg text-[#A7A7A7]">{props.subheading}</h5>
        </div>
        <img
          className="w-[225px] md:w-[250px] lg:w-[300px]"
          src={props.art.src}
          alt="card art"
        ></img>
      </div>
    </div>
  );
}
