interface CursorProps {
  x: number;
  y: number;
  color: string;
}

export function Cursor({ x, y, color }: CursorProps) {
  return (
    <svg
      width="24"
      height="36"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      className="left-0 top-0 absolute z-[1000] pointer-events-none transition-transform duration-100 ease-linear motion-reduce:transition-none"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
      />
    </svg>
  );
}
