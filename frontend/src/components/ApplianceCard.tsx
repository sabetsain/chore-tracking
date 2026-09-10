import { useState, useEffect, useRef } from 'react';
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
  Coffee,
  WashingMachine,
  Box,
  Zap,
  RotateCcw,
  Pencil,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Appliance, ApplianceState } from '../types';
import { formatElapsedTime } from '../utils/time';
import { soundEffects } from '../utils/soundEffects';
import { PaperCard } from './stationery/PaperCard';
import { StatusStamp } from './stationery/StatusStamp';
import { IdentitySticker } from './stationery/IdentitySticker';
import { api } from '../api/client';

export interface ApplianceCardProps {
  appliance: Appliance;
  onUpdateState: (
    applianceId: string,
    toState: ApplianceState,
    timerDurationMinutes?: number
  ) => Promise<void>;
  onViewHistory: (appliance: Appliance) => void;
  onEdit?: (appliance: Appliance) => void;
  onReset?: (applianceId: string) => Promise<void>;
}

export function computeNextState(appliance: Appliance): ApplianceState {
  if (appliance.next_state) {
    return appliance.next_state as ApplianceState;
  }

  const steps = [
    appliance.state_step_1,
    appliance.state_step_2,
    appliance.state_step_3,
    appliance.state_step_4,
    appliance.state_step_5,
  ].filter(Boolean) as ApplianceState[];

  if (steps.length === 0) {
    if (appliance.type === 'dishwasher') {
      return appliance.current_state === 'dirty' ? 'running' : 'dirty';
    }
    return appliance.current_state === 'empty' ? 'running' : 'empty';
  }

  let current = appliance.current_state;
  if (current === 'clean_needs_emptying' && steps.includes('needs_attention')) {
    current = 'needs_attention';
  }

  const idx = steps.indexOf(current);
  if (idx === -1) {
    return steps[0];
  }
  return steps[(idx + 1) % steps.length];
}

export function getApplianceIcon(typeOrIcon?: string) {
  const key = (typeOrIcon || '').toLowerCase();
  switch (key) {
    case 'coffee':
      return Coffee;
    case 'washer':
    case 'washing machine':
      return WashingMachine;
    case 'dryer':
      return Wind;
    case 'dishwasher':
    case 'pot':
      return CookingPot;
    case 'box':
      return Box;
    case 'wind':
      return Wind;
    case 'waves':
      return Waves;
    case 'zap':
      return Zap;
    case 'sparkles':
    default:
      return Sparkles;
  }
}

function formatStateLabel(state: ApplianceState): string {
  switch (state) {
    case 'running':
      return 'Start Cycle';
    case 'needs_attention':
      return 'Mark Done';
    case 'clean':
      return 'Mark Clean';
    case 'empty':
    case 'dirty':
    case 'clean_needs_emptying':
      return 'Mark Emptied';
    default:
      return `Mark ${(state as string).replace(/_/g, ' ')}`;
  }
}

function getActionStyle(nextState: ApplianceState) {
  switch (nextState) {
    case 'running':
      return {
        bg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
        icon: Play,
      };
    case 'needs_attention':
    case 'clean':
      return {
        bg: 'bg-accent-sage hover:bg-[#2F523F] text-white',
        icon: CheckCircle2,
      };
    case 'empty':
    case 'dirty':
    case 'clean_needs_emptying':
    default:
      return {
        bg: 'bg-accent-slate hover:bg-[#1E334A] text-white',
        icon: Trash2,
      };
  }
}

export function ApplianceCard({
  appliance,
  onUpdateState,
  onViewHistory,
  onEdit,
  onReset,
}: ApplianceCardProps) {
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(
    appliance.default_timer_minutes || 45
  );
  const [customDuration, setCustomDuration] = useState<string>('');

  // Clock ticker for active countdown
  const [currentTime, setCurrentTime] = useState(Date.now());
  const hasChimedRef = useRef(false);

  const nextState = computeNextState(appliance);
  const actionConfig = getActionStyle(nextState);
  const Icon = getApplianceIcon(appliance.icon || appliance.type);
  const ActionIcon = actionConfig.icon;
  const tilt = appliance.id.charCodeAt(appliance.id.length - 1) % 2 === 0 ? 'left' : 'right';

  const isRunning = appliance.current_state === 'running';
  const hasTimer = Boolean(isRunning && appliance.timer_ends_at);

  useEffect(() => {
    if (!hasTimer) {
      hasChimedRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasTimer]);

  let remainingSeconds = 0;
  let isTimerExpired = false;

  if (hasTimer && appliance.timer_ends_at) {
    const endMs = new Date(appliance.timer_ends_at).getTime();
    const diffSeconds = Math.floor((endMs - currentTime) / 1000);
    remainingSeconds = Math.max(0, diffSeconds);
    isTimerExpired = diffSeconds <= 0;
  }

  // Chime when countdown hits 00:00
  useEffect(() => {
    if (hasTimer && isTimerExpired && !hasChimedRef.current) {
      hasChimedRef.current = true;
      soundEffects.playWoodClick();
    }
  }, [hasTimer, isTimerExpired]);

  // Primary action button handler
  const handlePrimaryAction = async () => {
    if (nextState === 'running' && appliance.timer_enabled) {
      // Open duration picker dialog
      setSelectedDuration(appliance.default_timer_minutes || 45);
      setCustomDuration('');
      setShowDurationPicker(true);
      return;
    }

    setLoading(true);
    try {
      soundEffects.playWoodClick();
      await onUpdateState(appliance.id, nextState);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDuration = async () => {
    const duration = customDuration ? parseInt(customDuration, 10) : selectedDuration;
    if (!duration || duration <= 0) return;

    setLoading(true);
    try {
      soundEffects.playWoodClick();
      setShowDurationPicker(false);
      await onUpdateState(appliance.id, 'running', duration);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      soundEffects.playWoodClick();
      if (onReset) {
        await onReset(appliance.id);
      } else {
        await api.resetAppliance(appliance.id);
      }
    } finally {
      setResetting(false);
    }
  };

  // Determine button state and label
  let buttonLabel = formatStateLabel(nextState);
  let isButtonDisabled = loading;

  if (isRunning && hasTimer) {
    if (isTimerExpired) {
      buttonLabel = `Confirm & Mark ${formatStateLabel(nextState).replace('Mark ', '')}`;
      isButtonDisabled = loading;
    } else {
      const mins = Math.floor(remainingSeconds / 60);
      buttonLabel = `Running (${mins}m remaining)`;
      isButtonDisabled = true;
    }
  }

  const presetChips = [15, 30, 45, 60];
  if (
    appliance.default_timer_minutes &&
    !presetChips.includes(appliance.default_timer_minutes)
  ) {
    presetChips.push(appliance.default_timer_minutes);
    presetChips.sort((a, b) => a - b);
  }

  return (
    <PaperCard
      variant="card"
      tilt={tilt}
      layoutId={`appliance-${appliance.id}`}
      className="p-5 flex flex-col justify-between min-h-[270px] border border-stone-200/80 dark:border-slate-700/80 shadow-paper-sm relative"
    >
      {/* Top section: Title, Icon, History & Edit */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#2C3952] border border-border-stone dark:border-slate-600 flex items-center justify-center text-accent-slate dark:text-slate-200 shadow-sm shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink-navy dark:text-slate-100 leading-tight">
                {appliance.name}
              </h3>
              <span className="font-mono text-[11px] text-ink-muted dark:text-slate-400 capitalize tracking-wider">
                {appliance.icon || appliance.type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(appliance)}
                className="p-1.5 text-ink-graphite hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Edit Appliance Settings"
                aria-label="Edit Appliance"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

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

        {/* Live Timer Countdown & Awaiting Confirmation Badge */}
        {isRunning && hasTimer && (
          <div className="my-2.5 p-2 rounded-lg bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-ink-navy dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-slate animate-pulse" />
                <span>Timer Countdown</span>
              </span>

              {isTimerExpired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-accent-ochre dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  AWAITING CONFIRMATION
                </span>
              ) : (
                <span className="text-xs font-mono font-bold tabular-nums text-accent-slate dark:text-slate-200">
                  {Math.floor(remainingSeconds / 60)}m remaining
                </span>
              )}
            </div>

            {isTimerExpired ? (
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-sans font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Timer complete (00:00) — Confirmation needed</span>
              </p>
            ) : (
              <div className="text-[11px] text-ink-muted dark:text-slate-400 font-mono tabular-nums">
                {Math.floor(remainingSeconds / 60)}m {String(remainingSeconds % 60).padStart(2, '0')}s remaining
              </div>
            )}
          </div>
        )}

        {/* Actor Info with IdentitySticker */}
        <div className="flex items-center gap-1.5 text-xs text-ink-graphite dark:text-slate-400 mb-3 font-sans">
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

      {/* Actions: Primary Next-State Button + Secondary Abort/Reset Button */}
      <div className="space-y-2 mt-2">
        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={handlePrimaryAction}
          className={`w-full min-h-[46px] py-3 px-4 rounded-xl font-sans text-sm font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none ${
            isTimerExpired
              ? 'bg-accent-sage hover:bg-[#2F523F] text-white'
              : actionConfig.bg
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <ActionIcon className="w-4 h-4" />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>

        {/* Secondary Abort / Reset Action */}
        <button
          type="button"
          disabled={resetting}
          onClick={handleReset}
          className="w-full py-1.5 px-3 rounded text-xs font-sans font-medium text-accent-crimson hover:text-[#852E35] dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 active:translate-y-[1px] transition flex items-center justify-center gap-1.5"
          title="Abort and reset cycle back to initial step"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Abort / Reset Cycle'}</span>
        </button>
      </div>

      {/* Duration Picker Dialog */}
      <AnimatePresence>
        {showDurationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-canvas-card dark:bg-[#1F1D1A] p-5 rounded-xl border border-stone-300 dark:border-slate-700 shadow-paper-lifted max-w-sm w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-slate" />
                  <h4 className="font-serif font-bold text-lg text-ink-navy dark:text-slate-100">
                    Set Cycle Duration
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDurationPicker(false)}
                  className="p-1 rounded text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="Close duration picker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans">
                Select run duration for <strong className="font-semibold">{appliance.name}</strong>:
              </p>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2">
                {presetChips.map((mins) => {
                  const isSelected = !customDuration && selectedDuration === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(mins);
                        setCustomDuration('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border tabular-nums active:translate-y-[1px] ${
                        isSelected
                          ? 'bg-accent-slate text-white border-accent-slate shadow-sm'
                          : 'bg-canvas-card dark:bg-[#222D42] text-ink-navy dark:text-slate-200 border-stone-300 dark:border-slate-600 hover:border-accent-slate'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>

              {/* Custom Minutes Input */}
              <div>
                <label
                  htmlFor="custom-minutes-input"
                  className="block text-xs font-medium text-ink-navy dark:text-slate-200 mb-1 font-sans"
                >
                  Custom Duration (Minutes)
                </label>
                <input
                  id="custom-minutes-input"
                  type="number"
                  min={1}
                  max={720}
                  placeholder="e.g. 50"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full px-3 py-1.5 bg-canvas-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-slate font-mono tabular-nums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDurationPicker(false)}
                  className="flex-1 py-2 bg-canvas-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-xs font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 transition active:translate-y-[1px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmDuration}
                  className="flex-1 py-2 bg-accent-slate hover:bg-[#1E334A] text-white text-xs font-sans font-bold rounded-lg shadow-paper-sm transition active:translate-y-[1px]"
                >
                  {loading ? 'Starting...' : 'Start Cycle'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PaperCard>
  );
}

export default ApplianceCard;
