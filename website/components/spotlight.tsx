// Copyright (c) 2023 Andreas Thomas
// https://github.com/chronark/chronark.com/blob/c3676d2b8da93820f38f65e6176fc62f8d309cd8/app/components/card.tsx

import classNames from 'classnames';
import { motion, useMotionTemplate, useSpring } from 'framer-motion';

export function Spotlight(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  const onMouseMove: React.MouseEventHandler<HTMLElement> = ({
    currentTarget,
    clientX,
    clientY,
  }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div onMouseMove={onMouseMove} className="relative h-full">
      <div className="pointer-events-none">
        <div className="absolute inset-0 z-0 opacity-0 transition-opacity [mask-image:linear-gradient(black,transparent)] group-hover:opacity-100" />
        <motion.div
          className={classNames(
            'absolute inset-0 z-10 opacity-0 transition-opacity group-hover:opacity-100',
            props.className,
          )}
          style={style}
        />
        <motion.div
          className="absolute inset-0 z-10 opacity-0 mix-blend-overlay transition-opacity group-hover:opacity-100"
          style={style}
        />
      </div>
      <div>{props.children}</div>
    </div>
  );
}
