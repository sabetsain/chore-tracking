import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  User,
  History,
  RotateCw,
  Play,
  CheckCircle2,
  Trash2,
  Waves,
  Wind,
  CookingPot,
} from 'lucide-react';
import { Appliance, ApplianceState, ApplianceType } from '../types';
import { formatElapsedTime } from '../utils/time';

interface ApplianceCardProps {
  appliance: Appliance;
  onUpdateState: (applianceId: string, toState: ApplianceState) => Promise<void>;
  onViewHistory: (appliance: Appliance) => void;
}

const NEXT_STATE_MAP: Record<
  ApplianceState,
  { next: ApplianceState; label: string; actionBg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  empty: {
    next: 'dirty',
    label: 'Mark Dirty',
    actionBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: RotateCw,
  },
  dirty: {
    next: 'running',
    label: 'Start Cycle',
    actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: Play,
  },
  running: {
    next: 'clean_needs_emptying',
    label: 'Mark Clean',
    actionBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: CheckCircle2,
  },
  clean_needs_emptying: {
    next: 'empty',
    label: 'Mark Emptied',
    actionBg: 'bg-slate-700 hover:bg-slate-800 text-white',
    icon: Trash2,
  },
};

const STATE_BADGE_MAP: Record<
  ApplianceState,
  { label: string; bg: string; text: string; border: string; pulse?: boolean }
> = {
  empty: {
    label: 'Empty',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  dirty: {
    label: 'Dirty',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  running: {
    label: 'Running',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    pulse: true,
  },
  clean_needs_emptying: {
    label: 'Clean / Needs Emptying',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

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
  const nextConfig = NEXT_STATE_MAP[appliance.current_state];
  const badgeConfig = STATE_BADGE_MAP[appliance.current_state];
  const Icon = getApplianceIcon(appliance.type);
  const ActionIcon = nextConfig.icon;

  const handleAction = async () => {
    setLoading(true);
    try {
      await onUpdateState(appliance.id, nextConfig.next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow transition p-5 flex flex-col justify-between">
      {/* Top section: Title, Icon & History */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight">
                {appliance.name}
              </h3>
              <span className="text-[11px] text-slate-400 capitalize">
                {appliance.type}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onViewHistory(appliance)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="View Activity History"
            aria-label="History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge & Elapsed Time */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border} ${
              badgeConfig.pulse ? 'animate-pulse' : ''
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {badgeConfig.label}
          </span>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatElapsedTime(appliance.state_updated_at)}</span>
          </div>
        </div>

        {/* Actor Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>
            by{' '}
            <strong className="font-medium text-slate-700">
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
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 ${nextConfig.actionBg} disabled:opacity-50`}
      >
        <ActionIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Updating...' : nextConfig.label}</span>
      </button>
    </div>
  );
}
