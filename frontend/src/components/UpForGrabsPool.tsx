import { useState } from 'react';
import { Sparkles, Hand, Star, Moon, AlertCircle, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Chore, ChoreAssignment } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { WashiTape } from './stationery/WashiTape';
import { soundEngine } from '../utils/soundEngine';

interface UpForGrabsPoolProps {
  chores: ChoreAssignment[];
  onClaimChore: (assignmentId: string) => Promise<void>;
  onEditChore?: (chore: Chore) => void;
  onDeleteChore?: (choreId: string) => Promise<void>;
}

interface DraggableMemoNoteProps {
  assignment: ChoreAssignment;
  idx: number;
  claimingId: string | null;
  onClaim: (id: string) => Promise<void>;
  onEdit?: (chore: Chore) => void;
  onDelete?: (choreId: string) => Promise<void>;
}

function DraggableMemoNote({
  assignment,
  idx,
  claimingId,
  onClaim,
  onEdit,
  onDelete,
}: DraggableMemoNoteProps) {
  const isAwayMember = assignment.member && assignment.member.status === 'away';
  const tapeColor = idx % 3 === 0 ? 'yellow' : idx % 3 === 1 ? 'green' : 'orange';
  const baseTilt = idx % 2 === 0 ? -1.5 : 1.5;
  const isClaiming = claimingId === assignment.id;

  const y = useMotionValue(0);
  const tapeOpacity = useTransform(y, [0, 80], [1, 0.2]);
  const tapeRotate = useTransform(y, [0, 80], [baseTilt, baseTilt + 12]);

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y >= 80 || info.velocity.y > 400) {
      onClaim(assignment.id);
    }
  };

  return (
    <div className="relative pt-2 select-none">
      {/* Animated Washi Tape with peel-away opacity on drag */}
      <motion.div
        style={{
          opacity: tapeOpacity,
          rotate: tapeRotate,
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <WashiTape color={tapeColor} tilt={0} width="w-24" />
      </motion.div>

      <motion.div
        drag={isClaiming ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 120 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        style={{ y }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        className="touch-pan-x"
      >
        <PaperCard
          variant={idx % 2 === 0 ? 'postit' : 'manila'}
          className="p-5 min-h-[220px] flex flex-col justify-between border border-amber-300/80 dark:border-slate-600 shadow-paper-sm hover:shadow-paper-md transition-shadow cursor-grab active:cursor-grabbing"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2 pt-1">
              <h4 className="font-serif font-bold text-xl text-ink-navy dark:text-slate-100 leading-tight">
                {assignment.chore.title}
              </h4>
              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(assignment.chore);
                    }}
                    className="p-1 rounded text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-700 transition"
                    title="Edit Chore"
                    aria-label={`Edit ${assignment.chore.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${assignment.chore.title}"?`)) {
                        soundEngine.playEraserSound();
                        await onDelete(assignment.chore.id);
                      }
                    }}
                    className="p-1 rounded text-ink-muted hover:text-stamp-dirty dark:text-slate-400 dark:hover:text-red-300 hover:bg-amber-100/60 dark:hover:bg-slate-700 transition"
                    title="Delete Chore"
                    aria-label={`Delete ${assignment.chore.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 font-sans font-bold text-xs border border-amber-300/80 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  {assignment.chore.effort_weight} pts
                </span>
              </div>
            </div>

            {assignment.chore.description && (
              <p className="text-xs text-ink-graphite dark:text-slate-400 mb-3 font-sans">
                {assignment.chore.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {isAwayMember ? (
                <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  <Moon className="w-3 h-3" />
                  {assignment.member!.nickname} (Away)
                </span>
              ) : (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-paper-card dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-stone-300 dark:border-slate-600">
                  Unassigned
                </span>
              )}
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-paper-card dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-stone-300 dark:border-slate-600">
                {assignment.chore.completion_type === 'single_weekly'
                  ? 'Weekly'
                  : 'Continuous'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-sans text-ink-muted dark:text-slate-400 text-center mb-1.5 flex items-center justify-center gap-1 opacity-80">
              <ArrowDown className="w-3 h-3 animate-bounce" />
              <span>Drag down 80px to claim</span>
            </div>
            <button
              type="button"
              disabled={isClaiming}
              onClick={() => onClaim(assignment.id)}
              className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Hand className="w-4 h-4" />
              <span>{isClaiming ? 'Claiming...' : 'Claim Chore'}</span>
            </button>
          </div>
        </PaperCard>
      </motion.div>
    </div>
  );
}

export function UpForGrabsPool({
  chores,
  onClaimChore,
  onEditChore,
  onDeleteChore,
}: UpForGrabsPoolProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async (assignmentId: string) => {
    setClaimingId(assignmentId);
    setError(null);
    try {
      soundEngine.playTapePeelSound();
      await onClaimChore(assignmentId);
    } catch (err: any) {
      setError(err.message || 'Failed to claim chore');
    } finally {
      setClaimingId(null);
    }
  };

  if (chores.length === 0) {
    return (
      <PaperCard variant="card" className="p-8 text-center border-dashed border-2 border-stone-300 dark:border-slate-700">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
        <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100">No Chores Up for Grabs</h3>
        <p className="text-xs text-ink-muted dark:text-slate-400 mt-1 font-sans">
          All chores are currently assigned to active roommates!
        </p>
      </PaperCard>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-slate-700/80">
        <div>
          <h3 className="text-2xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Up for Grabs Pool</span>
          </h3>
          <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans mt-0.5">
            Pinned sticky memo notes: unassigned tasks and chores from roommates currently marked Away.
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-sans font-bold border border-amber-300 dark:border-amber-700 shadow-sm">
          {chores.length} Available
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {chores.map((assignment, idx) => (
          <DraggableMemoNote
            key={assignment.id}
            assignment={assignment}
            idx={idx}
            claimingId={claimingId}
            onClaim={handleClaim}
            onEdit={onEditChore}
            onDelete={onDeleteChore}
          />
        ))}
      </div>
    </div>
  );
}
