import React, { useMemo } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export type StampStatus = 'clean' | 'dirty' | 'running' | 'empty' | 'clean_needs_emptying' | (string & {});

export interface RubberStampBadgeProps {
  status: StampStatus;
  label?: string;
  sublabel?: string;
  rotation?: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_LABELS: Record<string, string> = {
  clean: 'CLEAN',
  dirty: 'DIRTY',
  running: 'RUNNING',
  empty: 'READY TO RUN!',
  clean_needs_emptying: 'CLEAN - NEEDS EMPTYING',
};

const DEFAULT_ROTATIONS: Record<string, number> = {
  clean: -2.5,
  dirty: 3.2,
  running: -1.2,
  empty: -2.0,
  clean_needs_emptying: 1.8,
};

export const RubberStampBadge: React.FC<RubberStampBadgeProps> = ({
  status,
  label,
  sublabel,
  rotation,
  animated = true,
  size = 'md',
  className,
}) => {
  const normalizedStatus = status.toLowerCase();

  const angle = useMemo(() => {
    if (typeof rotation === 'number') return rotation;
    return DEFAULT_ROTATIONS[normalizedStatus] ?? -2;
  }, [rotation, normalizedStatus]);

  const displayLabel = label || DEFAULT_LABELS[normalizedStatus] || status.toUpperCase();

  const statusClass = useMemo(() => {
    switch (normalizedStatus) {
      case 'clean':
        return 'stamp-clean text-stamp-clean border-stamp-clean';
      case 'dirty':
        return 'stamp-dirty text-stamp-dirty border-stamp-dirty';
      case 'running':
        return 'stamp-running text-stamp-running border-stamp-running';
      case 'empty':
        return 'stamp-clean text-stamp-clean border-stamp-clean';
      case 'clean_needs_emptying':
        return 'stamp-empty text-stamp-empty border-stamp-empty';
      default:
        return 'text-ink-navy border-ink-navy';
    }
  }, [normalizedStatus]);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 border-[1.5px] tracking-wider',
    md: 'text-sm px-3.5 py-1 border-2 tracking-widest',
    lg: 'text-base sm:text-lg px-4 py-2 border-[2.5px] tracking-widest',
  }[size];

  const ariaLabel = `Status: ${displayLabel}${sublabel ? ` - ${sublabel}` : ''}`;

  return (
    <motion.span
      key={animated ? `${status}-${displayLabel}` : undefined}
      role="status"
      aria-label={ariaLabel}
      initial={animated ? { scale: 1.45, opacity: 0, rotate: angle } : { rotate: angle }}
      animate={{ scale: 1, opacity: 1, rotate: angle }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
      style={{
        transform: `rotate(${angle}deg)`,
        ['--stamp-angle' as string]: `${angle}deg`,
      }}
      className={clsx(
        'rubber-stamp inline-flex flex-col items-center justify-center font-hand font-bold uppercase select-none transition-transform rounded',
        statusClass,
        sizeClasses,
        className
      )}
    >
      <span className="leading-tight text-center">{displayLabel}</span>
      {sublabel && (
        <span className="text-[0.7em] font-sans font-semibold tracking-normal opacity-90 leading-tight mt-0.5 text-center">
          {sublabel}
        </span>
      )}
    </motion.span>
  );
};

export default RubberStampBadge;
