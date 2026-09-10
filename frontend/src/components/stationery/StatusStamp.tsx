import React, { useMemo } from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type StatusStampStatus =
  | 'clean'
  | 'dirty'
  | 'running'
  | 'empty'
  | 'clean_needs_emptying'
  | 'needs_attention'
  | 'claimed'
  | 'pending'
  | (string & {});

export interface StatusStampProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  status: StatusStampStatus;
  label?: string;
  sublabel?: string;
  rotation?: number;
  borderStyle?: 'dashed' | 'double';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const DEFAULT_LABELS: Record<string, string> = {
  clean: 'CLEAN',
  dirty: 'DIRTY',
  running: 'RUNNING',
  empty: 'EMPTY',
  clean_needs_emptying: 'CLEAN - NEEDS EMPTYING',
  needs_attention: 'NEEDS ATTENTION',
  claimed: 'CLAIMED',
  pending: 'PENDING',
};

const DEFAULT_ROTATIONS: Record<string, number> = {
  clean: -1.2,
  dirty: 1.4,
  running: -0.8,
  empty: -1.1,
  clean_needs_emptying: 1.2,
  needs_attention: 1.1,
  claimed: -0.6,
  pending: 0.7,
};

export const StatusStamp: React.FC<StatusStampProps> = ({
  status,
  label,
  sublabel,
  rotation,
  borderStyle = 'dashed',
  size = 'md',
  animated = true,
  className,
  style,
  ...rest
}) => {
  const normalizedStatus = status.toLowerCase();

  const angle = useMemo(() => {
    if (typeof rotation === 'number') return rotation;
    return DEFAULT_ROTATIONS[normalizedStatus] ?? -1.0;
  }, [rotation, normalizedStatus]);

  const displayLabel = label || DEFAULT_LABELS[normalizedStatus] || status.toUpperCase();

  const statusColorClasses = useMemo(() => {
    switch (normalizedStatus) {
      case 'clean':
      case 'claimed':
        return 'text-accent-sage border-accent-sage';
      case 'dirty':
        return 'text-accent-crimson border-accent-crimson';
      case 'running':
        return 'text-accent-slate border-accent-slate';
      case 'empty':
      case 'clean_needs_emptying':
      case 'needs_attention':
      case 'pending':
        return 'text-accent-ochre border-accent-ochre';
      default:
        return 'text-ink-primary border-ink-primary';
    }
  }, [normalizedStatus]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 tracking-wide',
    md: 'text-sm px-3 py-1 tracking-wider',
    lg: 'text-base px-4 py-1.5 tracking-widest',
  }[size];

  const borderClasses =
    borderStyle === 'double'
      ? 'border-[2.5px] border-double'
      : 'border-[1.5px] border-dashed';

  const ariaLabel = `Status: ${displayLabel}${sublabel ? ` - ${sublabel}` : ''}`;

  return (
    <motion.span
      key={animated ? `${status}-${displayLabel}` : undefined}
      role="status"
      aria-label={ariaLabel}
      initial={animated ? { scale: 1.04, opacity: 0.9, rotate: angle } : { rotate: angle }}
      animate={{ scale: 1.0, opacity: 1.0, rotate: angle }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
      className={clsx(
        'status-stamp inline-flex flex-col items-center justify-center font-mono font-bold uppercase select-none rounded bg-transparent',
        statusColorClasses,
        borderClasses,
        sizeClasses,
        className
      )}
      {...rest}
    >
      <span className="leading-tight text-center tabular-nums">{displayLabel}</span>
      {sublabel && (
        <span className="text-[0.7em] font-sans font-medium tracking-normal opacity-85 leading-tight mt-0.5 text-center lowercase first-letter:uppercase">
          {sublabel}
        </span>
      )}
    </motion.span>
  );
};

export default StatusStamp;
