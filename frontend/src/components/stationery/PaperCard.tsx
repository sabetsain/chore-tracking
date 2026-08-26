import React from 'react';
import clsx from 'clsx';

export type PaperCardVariant = 'card' | 'sheet' | 'manila' | 'postit';
export type PaperCardTilt = 'left' | 'right' | 'none';

export interface PaperCardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: PaperCardVariant;
  tilt?: PaperCardTilt;
  lifted?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
  children?: React.ReactNode;
  className?: string;
}

export const PaperCard = React.forwardRef<HTMLElement, PaperCardProps>(
  (
    {
      variant = 'card',
      tilt = 'none',
      lifted = false,
      as: Component = 'div',
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const variantClasses: Record<PaperCardVariant, string> = {
      card: 'bg-paper-card border-slate-300 dark:bg-[#283548] dark:border-slate-700',
      sheet: 'bg-paper-sheet border-slate-300 dark:bg-[#1E293B] dark:border-slate-700',
      manila: 'bg-paper-manila border-amber-200/80 dark:bg-[#334155] dark:border-slate-600',
      postit: 'bg-paper-postit border-yellow-300/80 dark:bg-[#3b4252] dark:border-yellow-700/50',
    };

    const tiltClasses: Record<PaperCardTilt, string> = {
      none: 'rotate-0',
      left: '-rotate-[0.4deg] hover:rotate-0 transition-transform duration-200',
      right: 'rotate-[0.6deg] hover:rotate-0 transition-transform duration-200',
    };

    const shadowClasses = lifted
      ? 'shadow-paper-lifted hover:shadow-paper-lifted'
      : 'shadow-paper-md hover:shadow-paper-lg transition-shadow duration-200';

    return React.createElement(
      Component,
      {
        ref,
        className: clsx(
          'relative rounded-sm border text-ink-navy dark:text-ink-navy p-5 transition-all',
          variantClasses[variant],
          tiltClasses[tilt],
          shadowClasses,
          className
        ),
        ...rest,
      },
      children
    );
  }
);

PaperCard.displayName = 'PaperCard';

export default PaperCard;
