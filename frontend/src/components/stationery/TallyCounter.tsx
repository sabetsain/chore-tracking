import React from 'react';
import clsx from 'clsx';

export interface TallyCounterProps {
  count: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Single 5-count or partial cluster renderer
const TallyCluster: React.FC<{ strokes: number; sizeClass: string }> = ({ strokes, sizeClass }) => {
  const isFull = strokes >= 5;
  const numVertical = Math.min(strokes, 4);

  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={clsx('inline-block text-ink-navy dark:text-ink-navy select-none', sizeClass)}
    >
      {/* 1st Stroke */}
      {numVertical >= 1 && (
        <path
          d="M 5 4 C 4.8 10, 5.2 18, 5 22"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {/* 2nd Stroke */}
      {numVertical >= 2 && (
        <path
          d="M 10 3 C 10.3 9, 9.7 17, 10 23"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {/* 3rd Stroke */}
      {numVertical >= 3 && (
        <path
          d="M 15 4 C 14.8 11, 15.2 18, 15 22"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {/* 4th Stroke */}
      {numVertical >= 4 && (
        <path
          d="M 20 3 C 20.2 10, 19.8 17, 20 23"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {/* 5th Diagonal Slash */}
      {isFull && (
        <path
          d="M 2 20 C 8 16, 16 10, 23 5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export const TallyCounter: React.FC<TallyCounterProps> = ({
  count,
  label,
  size = 'md',
  className,
}) => {
  const safeCount = Math.max(0, Math.floor(count));
  const fullClusters = Math.floor(safeCount / 5);
  const remainder = safeCount % 5;

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  const ariaDescription = `Tally count: ${safeCount}${label ? ` ${label}` : ''}`;

  return (
    <div
      role="img"
      aria-label={ariaDescription}
      className={clsx('inline-flex items-center flex-wrap gap-2', className)}
    >
      {safeCount === 0 ? (
        <span className="font-hand text-ink-muted text-sm italic select-none">
          0 {label || 'logged'}
        </span>
      ) : (
        <>
          {Array.from({ length: fullClusters }).map((_, idx) => (
            <TallyCluster key={`cluster-${idx}`} strokes={5} sizeClass={sizeStyles} />
          ))}
          {remainder > 0 && (
            <TallyCluster key="remainder" strokes={remainder} sizeClass={sizeStyles} />
          )}
          {label && (
            <span className="font-hand text-ink-graphite text-base ml-1 select-none">
              ({safeCount} {label})
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default TallyCounter;
