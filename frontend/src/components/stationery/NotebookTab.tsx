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
  colorClass,
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
        'relative px-4 sm:px-5 py-2 sm:py-2.5 font-sans text-sm sm:text-base font-semibold tracking-tight transition-all duration-150 rounded-lg select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-accent-slate',
        isActive
          ? (colorClass || 'bg-canvas-card dark:bg-[#222D42] text-accent-slate dark:text-white shadow-sm font-bold border border-border-stone/60 dark:border-slate-700/60')
          : 'text-ink-secondary dark:text-slate-400 hover:text-ink-primary dark:hover:text-slate-200 hover:bg-stone-200/50 dark:hover:bg-slate-800/50',
        className
      )}
    >
      <div className="flex items-center justify-center space-x-2">
        {Icon && <Icon className="w-4 h-4 opacity-90 flex-shrink-0" />}
        <span>{label}</span>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span
            className="ml-1.5 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-accent-crimson text-white shadow-sm leading-none"
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
