import React from 'react';
import clsx from 'clsx';

export type WashiTapeColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'white';
export type WashiTapeTilt = 'left' | 'right' | 'none';

export interface WashiTapeProps {
  color?: WashiTapeColor | (string & {});
  tilt?: WashiTapeTilt | number;
  width?: string;
  className?: string;
}

const COLOR_MAP: Record<WashiTapeColor, string> = {
  yellow: 'bg-yellow-200/80 border-yellow-300/60 dark:bg-yellow-400/50 dark:border-yellow-300/40',
  green: 'bg-emerald-200/80 border-emerald-300/60 dark:bg-emerald-400/50 dark:border-emerald-300/40',
  pink: 'bg-rose-200/80 border-rose-300/60 dark:bg-rose-400/50 dark:border-rose-300/40',
  blue: 'bg-sky-200/80 border-sky-300/60 dark:bg-sky-400/50 dark:border-sky-300/40',
  orange: 'bg-orange-200/80 border-orange-300/60 dark:bg-orange-400/50 dark:border-orange-300/40',
  white: 'bg-slate-100/80 border-slate-200/60 dark:bg-slate-200/40 dark:border-slate-300/30',
};

export const WashiTape: React.FC<WashiTapeProps> = ({
  color = 'yellow',
  tilt = 'none',
  width = 'w-20',
  className,
}) => {
  const colorClass = (color in COLOR_MAP) ? COLOR_MAP[color as WashiTapeColor] : color;

  let rotationStyle: React.CSSProperties = {};
  let tiltClass = '';

  if (typeof tilt === 'number') {
    rotationStyle = { transform: `translateX(-50%) rotate(${tilt}deg)` };
  } else if (tilt === 'left') {
    tiltClass = '-rotate-2';
  } else if (tilt === 'right') {
    tiltClass = 'rotate-2';
  }

  return (
    <div
      aria-hidden="true"
      style={rotationStyle}
      className={clsx(
        'absolute -top-3 left-1/2 -translate-x-1/2 h-6 backdrop-blur-[0.5px] shadow-sm z-10 opacity-85 select-none pointer-events-none',
        'border-y border-white/50',
        '[clip-path:polygon(0%_15%,4%_0%,96%_0%,100%_18%,97%_82%,100%_100%,3%_96%,0%_78%)]',
        width,
        tiltClass,
        colorClass,
        className
      )}
    />
  );
};

export default WashiTape;
