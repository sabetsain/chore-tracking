import React, { useMemo } from 'react';
import clsx from 'clsx';
import rough from 'roughjs';

export interface TallyCounterProps {
  count: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Single 5-count or partial cluster renderer
const TallyCluster: React.FC<{ strokes: number; sizeClass: string; clusterIndex: number }> = ({
  strokes,
  sizeClass,
  clusterIndex,
}) => {
  const isFull = strokes >= 5;
  const numVertical = Math.min(strokes, 4);

  const paths = useMemo(() => {
    try {
      const gen = rough.generator();
      const clusterSeed = clusterIndex * 100 + 33;
      const strokeList: string[] = [];

      // Vertical stroke anchors (x, y1, y2)
      const baseCoords = [
        { x: 5, y1: 4, y2: 22, angle: -1.5 },
        { x: 10, y1: 3, y2: 23, angle: 1.2 },
        { x: 15, y1: 4, y2: 22, angle: -0.8 },
        { x: 20, y1: 3, y2: 23, angle: 1.8 },
      ];

      for (let i = 0; i < numVertical; i++) {
        const c = baseCoords[i];
        const line = gen.line(c.x + (c.angle * 0.3), c.y1, c.x - (c.angle * 0.3), c.y2, {
          roughness: 1.1,
          bowing: 1.2,
          strokeWidth: 2.2,
          seed: clusterSeed + i * 11,
        });
        const p = gen.toPaths(line);
        strokeList.push(p[0]?.d || `M ${c.x} ${c.y1} C ${c.x} 10, ${c.x} 18, ${c.x} ${c.y2}`);
      }

      let crossbarPath: string | null = null;
      if (isFull) {
        const diag = gen.line(2, 20, 23, 5, {
          roughness: 1.2,
          bowing: 1.4,
          strokeWidth: 2.4,
          seed: clusterSeed + 99,
        });
        const p = gen.toPaths(diag);
        crossbarPath = p[0]?.d || 'M 2 20 C 8 16, 16 10, 23 5';
      }

      return { strokeList, crossbarPath };
    } catch {
      const fallbackList = [
        'M 5 4 C 4.8 10, 5.2 18, 5 22',
        'M 10 3 C 10.3 9, 9.7 17, 10 23',
        'M 15 4 C 14.8 11, 15.2 18, 15 22',
        'M 20 3 C 20.2 10, 19.8 17, 20 23',
      ].slice(0, numVertical);
      return {
        strokeList: fallbackList,
        crossbarPath: isFull ? 'M 2 20 C 8 16, 16 10, 23 5' : null,
      };
    }
  }, [numVertical, isFull, clusterIndex]);

  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={clsx('inline-block text-ink-navy dark:text-ink-navy select-none', sizeClass)}
    >
      {paths.strokeList.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
      {paths.crossbarPath && (
        <path
          d={paths.crossbarPath}
          stroke="currentColor"
          strokeWidth="2.0"
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
        <span className="font-sans text-ink-muted dark:text-slate-400 text-xs italic select-none">
          0 {label || 'logged'}
        </span>
      ) : (
        <>
          {Array.from({ length: fullClusters }).map((_, idx) => (
            <TallyCluster
              key={`cluster-${idx}`}
              clusterIndex={idx}
              strokes={5}
              sizeClass={sizeStyles}
            />
          ))}
          {remainder > 0 && (
            <TallyCluster
              key="remainder"
              clusterIndex={fullClusters}
              strokes={remainder}
              sizeClass={sizeStyles}
            />
          )}
          {label && (
            <span className="font-sans font-medium text-ink-graphite dark:text-slate-300 text-xs ml-1 select-none">
              ({safeCount} {label})
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default TallyCounter;
