import React, { useId, useMemo } from 'react';
import clsx from 'clsx';
import rough from 'roughjs';

export interface ScribbleCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  strikethrough?: boolean;
  size?: 'sm' | 'md' | 'lg';
  seed?: number;
}

export const ScribbleCheckbox: React.FC<ScribbleCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id: customId,
  className,
  strikethrough = true,
  size = 'md',
  seed,
}) => {
  const generatedId = useId();
  const inputId = customId || `scribble-check-${generatedId}`;

  const sizeDimensions = {
    sm: { box: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-6 h-6', text: 'text-lg' },
  }[size];

  const boxPathData = useMemo(() => {
    try {
      const gen = rough.generator();
      const s = seed ?? (typeof customId === 'string' ? customId.length + 42 : 42);
      const rect = gen.rectangle(2.5, 2.5, 19, 19, {
        roughness: 1.2,
        bowing: 1.5,
        strokeWidth: 2,
        seed: s,
      });
      const paths = gen.toPaths(rect);
      return paths[0]?.d || 'M3 4 C 8 3.5, 17 3.5, 21 4 C 21.5 9, 21.5 17, 21 21 C 16 21.5, 8 21.5, 3 21 C 2.5 16, 2.5 8, 3 4';
    } catch {
      return 'M3 4 C 8 3.5, 17 3.5, 21 4 C 21.5 9, 21.5 17, 21 21 C 16 21.5, 8 21.5, 3 21 C 2.5 16, 2.5 8, 3 4';
    }
  }, [seed, customId]);

  const checkPathData = useMemo(() => {
    try {
      const gen = rough.generator();
      const s = (seed ?? 101) + 7;
      const check = gen.path('M 4.5 12.5 C 7 15, 8.5 17.5, 10 20 C 13.5 14, 17.5 8, 22 4', {
        roughness: 1.1,
        bowing: 1.2,
        strokeWidth: 2.75,
        seed: s,
      });
      const paths = gen.toPaths(check);
      return paths[0]?.d || 'M4.5 12.5 C 7 15, 8.5 17.5, 10 20 C 13.5 14, 17.5 8, 22 4';
    } catch {
      return 'M4.5 12.5 C 7 15, 8.5 17.5, 10 20 C 13.5 14, 17.5 8, 22 4';
    }
  }, [seed]);

  const strikePathData = useMemo(() => {
    try {
      const gen = rough.generator();
      const s = (seed ?? 202) + 13;
      const strike = gen.path('M 0 6 Q 25 3, 50 7 T 100 6', {
        roughness: 1.3,
        bowing: 2,
        strokeWidth: 2,
        seed: s,
      });
      const paths = gen.toPaths(strike);
      return paths[0]?.d || 'M 0 6 Q 25 3, 50 7 T 100 6';
    } catch {
      return 'M 0 6 Q 25 3, 50 7 T 100 6';
    }
  }, [seed]);

  return (
    <label
      htmlFor={inputId}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
      }}
      className={clsx(
        'inline-flex items-center gap-3 cursor-pointer select-none group',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div className={clsx('relative flex-shrink-0 flex items-center justify-center', sizeDimensions.box)}>
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />

        {/* Hand-drawn Box SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-full h-full text-ink-graphite group-hover:text-ink-navy transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-ink-navy rounded-sm"
        >
          {/* Organic Uneven Box Outline */}
          <path
            d={boxPathData}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Organic Hand-Drawn Checkmark */}
          {checked && (
            <path
              d={checkPathData}
              stroke="var(--accent-sage, #3E6B52)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-scribble-check"
              pathLength="100"
            />
          )}
        </svg>
      </div>

      {/* Label Content with optional Scribble Strikethrough */}
      {label && (
        <span
          className={clsx(
            'relative font-sans text-ink-navy dark:text-slate-100 transition-colors',
            sizeDimensions.text,
            checked && 'text-ink-muted dark:text-slate-400'
          )}
        >
          {label}

          {/* Scribble Strikethrough line across text */}
          {checked && strikethrough && (
            <svg
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-3 pointer-events-none overflow-visible"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={strikePathData}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                className="animate-scribble-check text-ink-graphite dark:text-slate-400 opacity-80"
                pathLength="100"
              />
            </svg>
          )}
        </span>
      )}
    </label>
  );
};

export default ScribbleCheckbox;
