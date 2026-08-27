import React from 'react';
import clsx from 'clsx';

export type SpineOrientation = 'vertical' | 'horizontal';
export type SpineType = 'spiral' | 'rivet';

export interface SpiralSpineProps {
  orientation?: SpineOrientation;
  type?: SpineType;
  count?: number;
  className?: string;
}

export const SpiralSpine: React.FC<SpiralSpineProps> = ({
  orientation = 'vertical',
  type = 'spiral',
  count = 10,
  className,
}) => {
  const rings = Array.from({ length: count });

  if (type === 'rivet') {
    return (
      <div
        aria-hidden="true"
        className={clsx(
          'flex justify-around items-center select-none pointer-events-none z-20',
          orientation === 'vertical' ? 'flex-col h-full w-8 py-4' : 'flex-row w-full h-8 px-4',
          className
        )}
      >
        {rings.map((_, idx) => (
          <div
            key={idx}
            className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-600 to-amber-900 shadow-md border border-amber-950/60 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-inner" />
          </div>
        ))}
      </div>
    );
  }

  // Double-loop metal wire spiral spine
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'flex justify-between items-center select-none pointer-events-none z-20',
        orientation === 'vertical'
          ? 'flex-col h-full w-7 py-3'
          : 'flex-row w-full h-7 px-3',
        className
      )}
    >
      {rings.map((_, idx) => (
        <div
          key={idx}
          className={clsx(
            'relative flex items-center justify-center',
            orientation === 'vertical' ? 'w-full h-5 my-0.5' : 'h-full w-5 mx-0.5'
          )}
        >
          {/* Paper Hole */}
          <div
            className={clsx(
              'rounded-full bg-[#2A231C] dark:bg-black shadow-inner',
              orientation === 'vertical' ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5'
            )}
          />

          {/* Metal Wire Loop */}
          <svg
            className={clsx(
              'absolute drop-shadow-[0_2px_3px_rgba(15,23,42,0.25)]',
              orientation === 'vertical' ? '-left-1 w-8 h-4' : '-top-1 w-4 h-8'
            )}
            viewBox="0 0 32 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wire shadow / dark body */}
            <path
              d="M2 8 C 8 0, 24 0, 30 8"
              stroke="#64748b"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Metallic chrome highlight */}
            <path
              d="M2 8 C 8 0, 24 0, 30 8"
              stroke="#f8fafc"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-90"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default SpiralSpine;
