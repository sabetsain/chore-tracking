import React, { useId } from 'react';
import clsx from 'clsx';

export interface ScribbleCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  strikethrough?: boolean;
  size?: 'sm' | 'md' | 'lg';
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
}) => {
  const generatedId = useId();
  const inputId = customId || `scribble-check-${generatedId}`;

  const sizeDimensions = {
    sm: { box: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-6 h-6', text: 'text-lg' },
  }[size];

  return (
    <label
      htmlFor={inputId}
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
            d="M3 4 C 8 3.5, 17 3.5, 21 4 C 21.5 9, 21.5 17, 21 21 C 16 21.5, 8 21.5, 3 21 C 2.5 16, 2.5 8, 3 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Organic Hand-Drawn Checkmark */}
          {checked && (
            <path
              d="M4.5 12.5 C 7 15, 8.5 17.5, 10 20 C 13.5 14, 17.5 8, 22 4"
              stroke="#15803d"
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
            'relative font-body transition-colors text-ink-navy dark:text-ink-navy',
            sizeDimensions.text,
            checked && 'text-ink-muted dark:text-ink-muted'
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
                d="M 0 6 Q 25 3, 50 7 T 100 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                className="animate-scribble-check text-ink-graphite opacity-80"
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
