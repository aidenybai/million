import type { CSSProperties } from 'react';

interface ShimmerButtonProps {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- props
  [key: string]: any; // ...props
}

export const ShimmerButton = ({
  shimmerColor = '#ffffff',
  shimmerSize = '1px',
  shimmerDuration = '1.5s',
  borderRadius = '100px',
  background = 'radial-gradient(ellipse 80% 50% at 50% 120%,rgba(62, 61, 117),rgba(18, 18, 38))',
  className,
  children,
  ...props
}: ShimmerButtonProps) => {
  return (
    <button
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as CSSProperties
      }
      className={`
        flex text-white dark:text-black group relative cursor-pointer overflow-hidden whitespace-nowrap h-11 px-6  [background:var(--bg)] [border-radius:var(--radius)] transition-all shadow-[0_0_0_3px_rgba(255,255,255,0.3)_inset] hover:scale-105 duration-300 ${
          className || ''
        }
      `}
      {...props}
    >
      {/* spark container */}
      <div className="absolute inset-0 overflow-visible [container-type:size]">
        {/* spark */}
        <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none] ">
          {/* spark before */}
          <div className="absolute inset-[-100%] w-auto rotate-0 animate-spin [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,hsl(0_0%_100%/1)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>

      {/* backdrop */}
      <div className="absolute [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
      {/* content */}
      {children}
    </button>
  );
};
