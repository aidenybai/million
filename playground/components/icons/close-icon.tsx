import type { ComponentProps } from 'react';

type Props = ComponentProps<'svg'>;

export const CloseIcon = (props: Props) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      className="h-4 opacity-60 inline ml-4"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  );
};
