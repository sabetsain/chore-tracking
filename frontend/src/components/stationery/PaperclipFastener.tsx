import React from 'react';
import clsx from 'clsx';

export type PaperclipPosition = 'top-left' | 'top-center' | 'top-right' | 'custom';

export interface PaperclipFastenerProps {
  position?: PaperclipPosition;
  className?: string;
}

export const PaperclipFastener: React.FC<PaperclipFastenerProps> = ({
  position = 'top-left',
  className,
}) => {
  const positionClasses: Record<PaperclipPosition, string> = {
    'top-left': 'absolute -top-5 left-8',
    'top-center': 'absolute -top-5 left-1/2 -translate-x-1/2',
    'top-right': 'absolute -top-5 right-8',
    'custom': '',
  };

  return (
    <svg
      className={clsx(
        'w-8 h-14 z-30 drop-shadow-[1px_4px_4px_rgba(15,23,42,0.22)] pointer-events-none select-none',
        positionClasses[position],
        className
      )}
      viewBox="0 0 32 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Loop / Metal Wire Shadow & Body */}
      <path
        d="M10 20 V48 C10 54 22 54 22 48 V12 C22 4 4 4 4 12 V50 C4 60 28 60 28 50 V18"
        stroke="#64748b"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chrome Highlight Reflection */}
      <path
        d="M10 20 V48 C10 54 22 54 22 48 V12 C22 4 4 4 4 12 V50 C4 60 28 60 28 50 V18"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
};

export default PaperclipFastener;
