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
        'relative px-4 sm:px-5 py-2 sm:py-2.5 font-hand text-base sm:text-lg font-bold transition-all duration-150 rounded-t-lg border-t-2 border-x-2 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ink-navy',
        isActive
          ? 'bg-paper-sheet text-ink-navy border-slate-400 dark:border-slate-500 dark:bg-[#1E293B] dark:text-slate-100 z-20 shadow-[0_-3px_6px_rgba(0,0,0,0.06)] translate-y-[2px]'
          : clsx(
              'hover:opacity-100 text-ink-graphite border-slate-300 dark:border-slate-600 dark:text-slate-300 z-10 translate-y-1.5 opacity-85 dark:bg-[#334155]',
              colorClass || 'bg-[#e5decb]'
            ),
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 opacity-85 flex-shrink-0" />}
        <span>{label}</span>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span
            className="ml-1.5 px-1.5 py-0.2 text-xs font-mono font-bold rounded-full bg-stamp-dirty text-white shadow-sm"
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
