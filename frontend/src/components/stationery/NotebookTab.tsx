import React from 'react';
import clsx from 'clsx';

export interface NotebookTabProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badgeCount?: number;
  onClick?: () => void;
  colorClass?: string;
  id?: string;
  controls?: string;
  className?: string;
}

export const NotebookTab: React.FC<NotebookTabProps> = ({
  label,
  icon: Icon,
  isActive,
  badgeCount,
  onClick,
  colorClass = 'bg-paper-manila',
  id,
  controls,
  className,
}) => {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={controls}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={clsx(
        'relative px-4 sm:px-5 py-2 sm:py-2.5 font-sans text-sm sm:text-base font-semibold tracking-tight transition-all duration-150 rounded-t-lg border-t border-x select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ink-navy',
        isActive
          ? 'bg-paper-sheet text-ink-navy border-stone-300 dark:border-slate-600 dark:bg-[#1A2234] dark:text-slate-100 z-20 shadow-[0_-3px_8px_rgba(15,23,42,0.06)] translate-y-[1px]'
          : clsx(
              'hover:opacity-100 text-ink-graphite border-stone-200 dark:border-slate-700 dark:text-slate-300 z-10 translate-y-1 opacity-85 dark:bg-[#222D42]',
              colorClass || 'bg-[#F0EAE1]'
            ),
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 opacity-80 flex-shrink-0" />}
        <span>{label}</span>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span
            className="ml-1.5 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-stamp-dirty text-white shadow-sm leading-none"
            aria-label={`${badgeCount} items`}
          >
            {badgeCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default NotebookTab;
