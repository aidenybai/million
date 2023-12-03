interface CursorProps {
  x: number;
  y: number;
  color: string;
}

export function Cursor({ x, y, color }: CursorProps) {
  return (
    <svg
      width={14}
      height={19}
      viewBox="0 0 14 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      className="left-0 top-0 absolute z-[1000] pointer-events-none transition-transform duration-100 ease-linear motion-reduce:transition-none"
    >
      <path
        d="M6.15376 13.1689H5.96026L5.81717 13.2992L1 17.6845V2L12.2841 13.1689H6.15376Z"
        fill={color}
      />
    </svg>
  );
}
