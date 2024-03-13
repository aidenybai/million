import { m } from 'framer-motion';
import React from 'react';

const lineVariant = {
  final: {
    x1: '-50%',
    x2: '0%',
    y1: '-50%',
    y2: '-50%',
  },
  initial: {
    x1: '100%',
    x2: '150%',
    y1: '150%',
    y2: '150%',
  },
};

const RightLine = ({
  delay,
  d,
  stops,
  id,
}: {
  delay: number;
  d: string;
  stops: JSX.Element[];
  id: string;
}) => {
  return (
    <>
      <path d={d} stroke={`url(#${id})`} />
      <defs>
        <m.linearGradient
          id={id}
          variants={lineVariant}
          transition={{
            default: { duration: 3, repeat: Infinity, repeatType: 'loop' },
            delay: (delay * 750) / 1000,
          }}
          animate="final"
          initial="initial"
          gradientUnits="userSpaceOnUse"
        >
          {stops.map((stop) => stop)}
        </m.linearGradient>
      </defs>
    </>
  );
};

export default RightLine;
