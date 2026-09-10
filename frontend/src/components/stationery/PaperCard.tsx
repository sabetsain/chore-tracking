import React from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type PaperCardVariant = 'card' | 'sheet' | 'manila' | 'postit';
export type PaperCardTilt = 'left' | 'right' | 'none';

export interface PaperCardProps extends HTMLMotionProps<'div'> {
  variant?: PaperCardVariant;
  tilt?: PaperCardTilt;
  lifted?: boolean;
  layoutId?: string;
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
      layoutId,
      as: Component = 'div',
      children,
      className,
      whileHover,
      ...rest
    },
    ref
  ) => {
    const variantClasses: Record<PaperCardVariant, string> = {
      card: 'bg-[var(--canvas-card,#FDFAF6)] dark:bg-[var(--canvas-card,#1F1D1A)] border-[var(--border-stone,#E3DDD5)] dark:border-[var(--border-stone,#2E2A26)]',
      sheet: 'bg-[var(--canvas-card,#FDFAF6)] dark:bg-[var(--canvas-card,#1F1D1A)] border-[var(--border-stone,#E3DDD5)] dark:border-[var(--border-stone,#2E2A26)]',
      manila: 'bg-paper-manila border-[var(--border-stone,#E3DDD5)] dark:bg-[#2C3952] dark:border-slate-600/80',
      postit: 'bg-paper-postit border-[var(--border-stone,#E3DDD5)] dark:bg-[#37435B] dark:border-slate-600/80',
    };

    const tiltClasses: Record<PaperCardTilt, string> = {
      none: 'rotate-0',
      left: '-rotate-[0.4deg]',
      right: 'rotate-[0.6deg]',
    };

    const shadowClasses = lifted
      ? 'shadow-paper-lifted'
      : 'shadow-paper-sm hover:shadow-paper-md';

    const MotionComponent = React.useMemo(() => {
      switch (Component) {
        case 'article':
          return motion.article;
        case 'section':
          return motion.section;
        case 'li':
          return motion.li;
        default:
          return motion.div;
      }
    }, [Component]);

    const defaultHover = whileHover !== undefined ? whileHover : {
      y: -2,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    };

    return (
      <MotionComponent
        ref={ref as any}
        layoutId={layoutId}
        whileHover={defaultHover}
        className={clsx(
          'relative rounded-lg border text-ink-navy dark:text-slate-100 p-5 transition-all',
          variantClasses[variant],
          tiltClasses[tilt],
          shadowClasses,
          className
        )}
        {...(rest as any)}
      >
        {children}
      </MotionComponent>
    );
  }
);

PaperCard.displayName = 'PaperCard';

export default PaperCard;
