import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  CheckCircle,
  Plus,
  ArrowLeftRight,
  RotateCcw,
  Pencil,
  Trash2,
  Star,
  Moon,
  Hand,
} from 'lucide-react';
import { Chore, ChoreAssignment, Member } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { ScribbleCheckbox } from './stationery/ScribbleCheckbox';
import { TallyCounter } from './stationery/TallyCounter';
import { IdentitySticker } from './stationery/IdentitySticker';
import { soundEffects } from '../utils/soundEffects';
import { soundEngine } from '../utils/soundEngine';
import { triggerPaperDustCelebration } from '../utils/confetti';

export type ChoreCardVariant = 'mine' | 'roommate' | 'pool';

export interface ChoreCardProps {
  assignment: ChoreAssignment;
  variant: ChoreCardVariant;
  currentMember?: Member | null;
  allMembers?: Member[];
  isRotationActive?: boolean;
  onComplete?: (assignmentId: string) => Promise<void>;
  onUncomplete?: (assignmentId: string) => Promise<void>;
  onLogDuty?: (assignment: ChoreAssignment) => void;
  onUnclaim?: (assignmentId: string) => Promise<void>;
  onClaim?: (assignmentId: string) => Promise<void>;
  onSwap?: (assignment: ChoreAssignment) => void;
  onReassign?: (assignmentId: string, memberId: string) => Promise<void>;
  onEdit?: (chore: Chore) => void;
  onDelete?: (choreId: string) => Promise<void>;
  tilt?: 'left' | 'right' | 'none';
  className?: string;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  assignment,
  variant,
  currentMember,
  allMembers,
  isRotationActive = false,
  onComplete,
  onUncomplete,
  onLogDuty,
  onUnclaim,
  onClaim,
  onSwap,
  onReassign,
  onEdit,
  onDelete,
  tilt = 'none',
  className,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnclaiming, setIsUnclaiming] = useState(false);

  // Active members for reassignment dropdown
  const activeMembers = useMemo(() => {
    if (!allMembers || allMembers.length === 0) return [];
    return allMembers.filter((m) => m.status === 'active');
  }, [allMembers]);

  const handleComplete = async (e?: React.MouseEvent) => {
    if (!onComplete || isCompleting) return;
    setIsCompleting(true);
    try {
      soundEffects.playWoodClick();
      triggerPaperDustCelebration(e);
      await onComplete(assignment.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleUncomplete = async () => {
    if (!onUncomplete || isCompleting) return;
    setIsCompleting(true);
    try {
      soundEffects.playWoodClick();
      soundEngine.playEraserSound();
      await onUncomplete(assignment.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleClaim = async () => {
    if (!onClaim || isClaiming) return;
    setIsClaiming(true);
    try {
      soundEffects.playWoodClick();
      soundEngine.playTapePeelSound();
      await onClaim(assignment.id);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleUnclaim = async () => {
    if (!onUnclaim || isUnclaiming) return;
    setIsUnclaiming(true);
    try {
      soundEngine.playEraserSound();
      await onUnclaim(assignment.id);
    } finally {
      setIsUnclaiming(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to delete "${assignment.chore.title}"?`)) {
      soundEngine.playEraserSound();
      await onDelete(assignment.chore.id);
    }
  };

  const handleReassign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    if (targetId && targetId !== assignment.member_id && onReassign) {
      soundEngine.playEraserSound();
      await onReassign(assignment.id, targetId);
    }
  };

  const isCompleted = assignment.status === 'completed';
  const isAwayMember = assignment.member && assignment.member.status === 'away';
  const memberNickname =
    variant === 'mine'
      ? currentMember?.nickname || 'Me'
      : assignment.member?.nickname || 'Roommate';

  return (
    <PaperCard
      variant="card"
      tilt={tilt === 'left' ? 'left' : tilt === 'right' ? 'right' : undefined}
      className={clsx(
        'p-5 flex flex-col justify-between transition border bg-[#FDFAF6] dark:bg-[#1F1D1A]',
        isCompleted
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
          : 'border-stone-200/80 dark:border-slate-700/80 hover:border-accent-slate/50 shadow-paper-sm',
        className
      )}
    >
      <div>
        {/* Header Row: Title / Checkbox & Management Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {variant === 'mine' ? (
              <ScribbleCheckbox
                checked={isCompleted}
                disabled={isCompleting}
                onChange={(nextChecked) => {
                  if (nextChecked) {
                    handleComplete();
                  } else {
                    handleUncomplete();
                  }
                }}
                label={
                  <span className="font-sans font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                    {assignment.chore.title}
                  </span>
                }
              />
            ) : variant === 'roommate' ? (
              <ScribbleCheckbox
                checked={isCompleted}
                disabled={true}
                label={
                  <span className="font-sans font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                    {assignment.chore.title}
                  </span>
                }
              />
            ) : (
              <h4 className="font-serif font-bold text-xl text-ink-navy dark:text-slate-100 leading-tight">
                {assignment.chore.title}
              </h4>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(assignment.chore);
                }}
                className="p-1 rounded text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                title="Edit Chore"
                aria-label={`Edit ${assignment.chore.title}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 rounded text-ink-muted hover:text-stamp-dirty dark:text-slate-400 dark:hover:text-red-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                title="Delete Chore"
                aria-label={`Delete ${assignment.chore.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs border border-border-stone dark:border-slate-700 shadow-sm shrink-0">
              <Star className="w-3 h-3 fill-accent-slate text-accent-slate" />
              {assignment.chore.effort_weight} pts
            </span>
          </div>
        </div>

        {/* Chore Description */}
        {assignment.chore.description && (
          <p className="text-xs text-ink-graphite dark:text-slate-400 mb-3 font-sans">
            {assignment.chore.description}
          </p>
        )}

        {/* Metadata & Status Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {variant !== 'pool' && (
            <IdentitySticker name={memberNickname} size="sm" />
          )}

          {variant === 'pool' && isAwayMember && (
            <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-accent-slate dark:text-slate-300 border border-border-stone dark:border-slate-700">
              <Moon className="w-3 h-3" />
              {assignment.member!.nickname} (Away)
            </span>
          )}

          {variant === 'pool' && !isAwayMember && (
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-paper-card dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-stone-300 dark:border-slate-600">
              Unassigned
            </span>
          )}

          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-border-stone dark:border-slate-600">
            {assignment.chore.completion_type === 'single_weekly'
              ? 'Weekly check-off'
              : 'Continuous duty'}
          </span>

          {isCompleted && (
            <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-stamp-clean dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Completed
            </span>
          )}
        </div>

        {/* Continuous Duty Tally Counter */}
        {variant !== 'pool' && assignment.chore.completion_type === 'continuous_duty' && (
          <div className="my-2 p-2 bg-paper-sheet dark:bg-[#1A2234] rounded border border-stone-200/80 dark:border-slate-700">
            <TallyCounter
              count={assignment.duty_instances_count || (isCompleted ? 1 : 0)}
              label="instances"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Action Rail */}
      <div>
        {/* Variant: Mine Actions */}
        {variant === 'mine' && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-stone-200/80 dark:border-slate-700/80">
            {assignment.chore.completion_type === 'single_weekly' ? (
              isCompleted ? (
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={handleUncomplete}
                  className="flex-1 min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 font-sans font-semibold text-xs rounded-lg border border-border-stone dark:border-slate-700 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  title="Undo chore completion"
                  aria-label="Undo chore completion"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isCompleting ? 'Undoing...' : 'Undo / Uncheck'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={(e) => handleComplete(e)}
                  className="flex-1 min-h-[44px] py-2 px-3 bg-accent-sage hover:bg-emerald-700 text-white font-sans font-bold text-sm rounded-lg shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isCompleting ? 'Marking...' : 'Mark Done'}</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => onLogDuty?.(assignment)}
                className="flex-1 min-h-[44px] py-2 px-3 bg-accent-sage hover:bg-emerald-700 text-white font-sans font-bold text-sm rounded-lg shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log Duty</span>
              </button>
            )}

            {!isRotationActive && onUnclaim && assignment.status === 'pending' && (
              <button
                type="button"
                disabled={isUnclaiming}
                onClick={handleUnclaim}
                className="min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-ink-navy dark:text-slate-200 font-sans font-semibold text-xs rounded-lg border border-stone-300 dark:border-slate-500 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                title="Release chore back to Up-for-Grabs pool"
                aria-label="Release or Unclaim Chore"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isUnclaiming ? 'Releasing...' : '↩️ Release / Unclaim'}</span>
              </button>
            )}

            {onSwap && assignment.status === 'pending' && (
              <button
                type="button"
                onClick={() => onSwap(assignment)}
                className="min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-ink-navy dark:text-slate-200 font-sans font-bold text-sm rounded-lg border border-border-stone dark:border-slate-500 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
                title="Swap chore with roommate"
                aria-label="Swap Chore"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            )}
          </div>
        )}

        {/* Variant: Roommate Actions */}
        {variant === 'roommate' && assignment.chore.completion_type === 'continuous_duty' && (
          <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onLogDuty?.(assignment)}
              className="w-full min-h-[44px] py-2 px-3 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs rounded-lg border border-stone-300 dark:border-slate-600 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Instance</span>
            </button>
          </div>
        )}

        {/* Variant: Pool Actions */}
        {variant === 'pool' && onClaim && (
          <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-slate-700/80">
            <button
              type="button"
              disabled={isClaiming}
              onClick={handleClaim}
              className="w-full min-h-[44px] py-2.5 px-4 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              aria-label="Claim Chore"
            >
              <Hand className="w-4 h-4" />
              <span>{isClaiming ? 'Claiming...' : 'Claim Chore'}</span>
            </button>
          </div>
        )}

        {/* Reassignment Control (for mine and roommate variants) */}
        {variant !== 'pool' && onReassign && activeMembers.length > 1 && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-200/60 dark:border-slate-700/60">
            <label
              htmlFor={`reassign-${variant}-${assignment.id}`}
              className="text-[11px] font-sans font-semibold text-ink-graphite dark:text-slate-400 shrink-0"
            >
              Reassign:
            </label>
            <select
              id={`reassign-${variant}-${assignment.id}`}
              aria-label={`Reassign ${assignment.chore.title}`}
              value={assignment.member_id || currentMember?.id || ''}
              onChange={handleReassign}
              className="w-full py-1 px-2 text-xs font-sans bg-paper-card dark:bg-[#222D42] text-ink-navy dark:text-slate-200 border border-stone-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-accent-slate cursor-pointer"
            >
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {currentMember && m.id === currentMember.id ? `${m.nickname} (Me)` : m.nickname}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </PaperCard>
  );
};

export default ChoreCard;
