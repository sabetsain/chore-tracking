import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  User,
  History,
  Play,
  CheckCircle2,
  Trash2,
  Waves,
  Wind,
  CookingPot,
} from 'lucide-react';
import { Appliance, ApplianceState, ApplianceType } from '../types';
import { formatElapsedTime } from '../utils/time';
import { soundEngine } from '../utils/soundEngine';
import { PaperCard } from './stationery/PaperCard';
import { RubberStampBadge } from './stationery/RubberStampBadge';

interface ApplianceCardProps {
  appliance: Appliance;
  onUpdateState: (applianceId: string, toState: ApplianceState) => Promise<void>;
  onViewHistory: (appliance: Appliance) => void;
}

interface NextStateConfig {
  next: ApplianceState;
  label: string;
  actionBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getNextStateConfig(type: ApplianceType, currentState: ApplianceState): NextStateConfig {
  if (type === 'washer' || type === 'dryer') {
    switch (currentState) {
      case 'empty':
        return {
          next: 'running',
          label: 'Start Cycle',
          actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: Play,
        };
      case 'running':
        return {
          next: 'clean_needs_emptying',
          label: 'Mark Clean',
          actionBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: CheckCircle2,
        };
      case 'clean_needs_emptying':
        return {
          next: 'empty',
          label: 'Mark Emptied',
          actionBg: 'bg-slate-700 hover:bg-slate-800 text-white',
          icon: Trash2,
        };
      case 'dirty':
      default:
        return {
          next: 'running',
          label: 'Start Cycle',
          actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: Play,
        };
    }
  }

  // Dishwasher & custom appliances
  switch (currentState) {
    case 'empty':
      return {
        next: 'running',
        label: 'Start Cycle',
        actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: Play,
      };
    case 'dirty':
      return {
        next: 'running',
        label: 'Start Cycle',
        actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: Play,
      };
    case 'running':
      return {
        next: 'clean_needs_emptying',
        label: 'Mark Clean',
        actionBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        icon: CheckCircle2,
      };
    case 'clean_needs_emptying':
    default:
      return {
        next: 'dirty',
        label: 'Mark Emptied',
        actionBg: 'bg-slate-700 hover:bg-slate-800 text-white',
        icon: Trash2,
      };
  }
}

function getApplianceIcon(type: ApplianceType) {
  switch (type) {
    case 'dishwasher':
      return CookingPot;
    case 'washer':
      return Waves;
    case 'dryer':
      return Wind;
    default:
      return Sparkles;
  }
}

export function ApplianceCard({ appliance, onUpdateState, onViewHistory }: ApplianceCardProps) {
  const [loading, setLoading] = useState(false);
  const nextConfig = getNextStateConfig(appliance.type, appliance.current_state);
  const Icon = getApplianceIcon(appliance.type);
  const ActionIcon = nextConfig.icon;
  const tilt = appliance.id.charCodeAt(appliance.id.length - 1) % 2 === 0 ? 'left' : 'right';

  const handleAction = async () => {
    setLoading(true);
    try {
      soundEngine.playStampSound();
      await onUpdateState(appliance.id, nextConfig.next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperCard
      variant="card"
      tilt={tilt}
      layoutId={`appliance-${appliance.id}`}
      className="p-5 flex flex-col justify-between min-h-[250px] border border-stone-200/80 dark:border-slate-700/80 shadow-paper-sm"
    >
      {/* Top section: Title, Icon & History */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-[#2C3952] border border-amber-200/80 dark:border-slate-600 flex items-center justify-center text-amber-900 dark:text-amber-200 shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink-navy dark:text-slate-100 leading-tight">
                {appliance.name}
              </h3>
              <span className="font-mono text-[11px] text-ink-muted dark:text-slate-400 capitalize tracking-wider">
                {appliance.type}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onViewHistory(appliance)}
            className="p-1.5 text-ink-graphite hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-700 rounded-lg transition"
            title="View Activity History"
            aria-label="History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* Rubber Stamp Status Badge & Duration */}
        <div className="flex items-center justify-between gap-3 my-3">
          <RubberStampBadge
            status={appliance.current_state}
            animated={true}
            size="md"
          />

          <div className="flex items-center gap-1.5 text-xs text-ink-graphite dark:text-slate-400 font-mono font-medium shrink-0">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>{formatElapsedTime(appliance.state_updated_at)}</span>
          </div>
        </div>

        {/* Actor Info */}
        <div className="flex items-center gap-1.5 text-xs text-ink-graphite dark:text-slate-400 mb-4 font-sans">
          <User className="w-3.5 h-3.5 text-ink-muted" />
          <span>
            by{' '}
            <strong className="font-sans font-semibold text-xs text-ink-navy dark:text-slate-200">
              {appliance.updated_by_member ? appliance.updated_by_member.nickname : 'System/Sensor'}
            </strong>
          </span>
        </div>
      </div>

      {/* 1-Tap Next Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleAction}
        className={`w-full py-2.5 px-4 rounded-lg font-sans text-sm font-bold tracking-wide shadow-paper-sm hover:shadow-paper-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${nextConfig.actionBg} disabled:opacity-50`}
      >
        <ActionIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Updating...' : nextConfig.label}</span>
      </button>
    </PaperCard>
  );
}
