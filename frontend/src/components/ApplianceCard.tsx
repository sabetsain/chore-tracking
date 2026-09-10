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
  Loader2,
} from 'lucide-react';
import { Appliance, ApplianceState, ApplianceType } from '../types';
import { formatElapsedTime } from '../utils/time';
import { soundEffects } from '../utils/soundEffects';
import { PaperCard } from './stationery/PaperCard';
import { StatusStamp } from './stationery/StatusStamp';
import { IdentitySticker } from './stationery/IdentitySticker';

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
          actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
          icon: Play,
        };
      case 'running':
        return {
          next: 'clean_needs_emptying',
          label: 'Mark Clean',
          actionBg: 'bg-accent-sage hover:bg-[#2F523F] text-white',
          icon: CheckCircle2,
        };
      case 'clean_needs_emptying':
        return {
          next: 'empty',
          label: 'Mark Emptied',
          actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
          icon: Trash2,
        };
      case 'dirty':
      default:
        return {
          next: 'running',
          label: 'Start Cycle',
          actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
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
        actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
        icon: Play,
      };
    case 'dirty':
      return {
        next: 'running',
        label: 'Start Cycle',
        actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
        icon: Play,
      };
    case 'running':
      return {
        next: 'clean_needs_emptying',
        label: 'Mark Clean',
        actionBg: 'bg-accent-sage hover:bg-[#2F523F] text-white',
        icon: CheckCircle2,
      };
    case 'clean_needs_emptying':
    default:
      return {
        next: 'dirty',
        label: 'Mark Emptied',
        actionBg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
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
      soundEffects.playWoodClick();
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
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#2C3952] border border-border-stone dark:border-slate-600 flex items-center justify-center text-accent-slate dark:text-slate-200 shadow-sm">
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
            className="p-1.5 text-ink-graphite hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="View Activity History"
            aria-label="History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* StatusStamp Badge & Duration */}
        <div className="flex items-center justify-between gap-3 my-3">
          <StatusStamp
            status={appliance.current_state}
            size="md"
            animated={true}
          />

          <div className="flex items-center gap-1.5 text-xs text-ink-graphite dark:text-slate-400 font-mono font-medium tabular-nums shrink-0">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span className="tabular-nums">{formatElapsedTime(appliance.state_updated_at)}</span>
          </div>
        </div>

        {/* Actor Info */}
        <div className="flex items-center gap-1.5 text-xs text-ink-graphite dark:text-slate-400 mb-4 font-sans">
          {appliance.updated_by_member ? (
            <>
              <IdentitySticker name={appliance.updated_by_member.nickname} size="sm" />
              <span>
                by{' '}
                <strong className="font-sans font-semibold text-xs text-ink-navy dark:text-slate-200">
                  {appliance.updated_by_member.nickname}
                </strong>
              </span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-ink-muted" />
              <span>
                by{' '}
                <strong className="font-sans font-semibold text-xs text-ink-navy dark:text-slate-200">
                  System/Sensor
                </strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Full-width 4-state action button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleAction}
        className={`w-full min-h-[46px] py-3 px-4 rounded-xl font-sans text-sm font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none ${nextConfig.actionBg}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <ActionIcon className="w-4 h-4" />
            <span>{nextConfig.label}</span>
          </>
        )}
      </button>
    </PaperCard>
  );
}

