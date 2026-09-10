import { useState, useMemo } from 'react';
import {
  CheckCircle,
  Plus,
  ArrowLeftRight,
  Moon,
  Sun,
  Star,
  RotateCcw,
  Shuffle,
  Pause,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Chore, ChoreAssignment, ChoreCompletionType, Household, Member } from '../types';
import { ChoreLogModal } from './ChoreLogModal';
import { CreateChoreModal } from './CreateChoreModal';
import { PaperCard } from './stationery/PaperCard';
import { ScribbleCheckbox } from './stationery/ScribbleCheckbox';
import { TallyCounter } from './stationery/TallyCounter';
import { IdentitySticker } from './stationery/IdentitySticker';
import { soundEngine } from '../utils/soundEngine';
import { soundEffects } from '../utils/soundEffects';
import { triggerPaperDustCelebration } from '../utils/confetti';

interface ChoreDutyViewProps {
  currentMember: Member;
  household?: Household;
  assignments: ChoreAssignment[];
  onCompleteChore: (assignmentId: string) => Promise<void>;
  onUncompleteChore?: (assignmentId: string) => Promise<void>;
  onReassignChore?: (assignmentId: string, memberId: string) => Promise<void>;
  onLogDuty: (assignmentId: string, note?: string) => Promise<void>;
  onToggleAway: (status: 'active' | 'away') => Promise<void>;
  onOpenSwap?: (assignment: ChoreAssignment) => void;
  onCreateChore?: (data: {
    title: string;
    description?: string;
    effort_weight: number;
    completion_type: ChoreCompletionType;
  }) => Promise<void>;
  allMembers?: Member[];
  onActivateRotation?: () => Promise<void>;
  onDeactivateRotation?: () => Promise<void>;
  onReshuffleRotation?: () => Promise<void>;
  onUnclaimChore?: (assignmentId: string) => Promise<void>;
  onEditChore?: (chore: Chore) => void;
  onDeleteChore?: (choreId: string) => Promise<void>;
}

export function ChoreDutyView({
  currentMember,
  household,
  assignments,
  onCompleteChore,
  onUncompleteChore,
  onReassignChore,
  onLogDuty,
  onToggleAway,
  onOpenSwap,
  onCreateChore,
  allMembers,
  onActivateRotation,
  onDeactivateRotation,
  onReshuffleRotation,
  onUnclaimChore,
  onEditChore,
  onDeleteChore,
}: ChoreDutyViewProps) {
  const [activeLogAssignment, setActiveLogAssignment] = useState<ChoreAssignment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [unclaimingId, setUnclaimingId] = useState<string | null>(null);
  const [togglingAway, setTogglingAway] = useState<boolean>(false);
  const [rotating, setRotating] = useState<boolean>(false);

  const isRotationActive = household?.chore_rotation_active ?? false;

  // Derive unique active members for reassignment
  const activeMembers = useMemo(() => {
    const memberMap = new Map<string, Member>();
    if (allMembers && allMembers.length > 0) {
      allMembers.forEach((m) => memberMap.set(m.id, m));
    } else {
      if (currentMember) memberMap.set(currentMember.id, currentMember);
      assignments.forEach((a) => {
        if (a.member) memberMap.set(a.member.id, a.member);
      });
    }
    return Array.from(memberMap.values()).filter((m) => m.status === 'active');
  }, [allMembers, assignments, currentMember]);

  // Group assignments by member
  const myAssignments = assignments.filter((a) => a.member_id === currentMember.id);
  const otherMembersMap = new Map<string, { member: Member; assignments: ChoreAssignment[] }>();

  assignments.forEach((a) => {
    if (a.member_id && a.member_id !== currentMember.id && a.member) {
      if (!otherMembersMap.has(a.member_id)) {
        otherMembersMap.set(a.member_id, {
          member: a.member,
          assignments: [],
        });
      }
      otherMembersMap.get(a.member_id)!.assignments.push(a);
    }
  });

  const handleComplete = async (assignmentId: string) => {
    setCompletingId(assignmentId);
    try {
      soundEffects.playWoodClick();
      await onCompleteChore(assignmentId);

      // Check if all assigned duties are completed
      const remainingPending = myAssignments.filter(
        (a) => a.id !== assignmentId && a.status === 'pending'
      );
      if (remainingPending.length === 0) {
        triggerPaperDustCelebration();
      }
    } finally {
      setCompletingId(null);
    }
  };

  const handleUncomplete = async (assignmentId: string) => {
    setCompletingId(assignmentId);
    try {
      soundEffects.playWoodClick();
      soundEngine.playEraserSound();
      if (onUncompleteChore) {
        await onUncompleteChore(assignmentId);
      }
    } finally {
      setCompletingId(null);
    }
  };

  const handleUnclaim = async (assignmentId: string) => {
    if (!onUnclaimChore) return;
    setUnclaimingId(assignmentId);
    try {
      soundEngine.playEraserSound();
      await onUnclaimChore(assignmentId);
    } finally {
      setUnclaimingId(null);
    }
  };

  const handleReassign = async (assignmentId: string, memberId: string) => {
    try {
      soundEngine.playEraserSound();
      if (onReassignChore) {
        await onReassignChore(assignmentId, memberId);
      }
    } catch {
      // Gracefully ignore error
    }
  };

  const handleAwayToggle = async () => {
    setTogglingAway(true);
    try {
      const nextStatus = currentMember.status === 'active' ? 'away' : 'active';
      await onToggleAway(nextStatus);
    } finally {
      setTogglingAway(false);
    }
  };

  const handleActivateRotation = async () => {
    if (!onActivateRotation) return;
    setRotating(true);
    try {
      soundEngine.playPencilScribbleSound();
      await onActivateRotation();
    } finally {
      setRotating(false);
    }
  };

  const handleDeactivateRotation = async () => {
    if (!onDeactivateRotation) return;
    setRotating(true);
    try {
      soundEngine.playEraserSound();
      await onDeactivateRotation();
    } finally {
      setRotating(false);
    }
  };

  const handleReshuffleRotation = async () => {
    if (!onReshuffleRotation) return;
    setRotating(true);
    try {
      soundEngine.playPencilScribbleSound();
      await onReshuffleRotation();
    } finally {
      setRotating(false);
    }
  };

  const isAway = currentMember.status === 'away';

  return (
    <div className="space-y-8">
      {/* Top Banner / Member Status */}
      <PaperCard variant="card" className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-200/80 dark:border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-ink-navy dark:text-slate-100">Weekly Chore Duties</h2>
            {isAway && (
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-slate-800 border border-border-stone dark:border-slate-700 text-accent-slate dark:text-slate-300 text-xs font-sans font-semibold">
                Away
              </span>
            )}
            {!isRotationActive && (
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-ink-muted dark:text-slate-300 text-xs font-sans font-semibold">
                Rotation Paused
              </span>
            )}
          </div>
          <p className="text-xs text-ink-graphite dark:text-slate-400 mt-1 font-sans">
            {isAway
              ? 'You are currently marked as Away. Your chores are up for grabs.'
              : !isRotationActive
              ? 'Chore rotation is currently paused. Chores are available in the Up-for-Grabs pool.'
              : 'Complete your weekly chores or log continuous duty instances on the ledger.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRotationActive && onReshuffleRotation && (
            <button
              type="button"
              disabled={rotating}
              onClick={handleReshuffleRotation}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 shadow-paper-sm transition-all active:scale-95 disabled:opacity-50"
              title="Re-distribute chores across buckets"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{rotating ? 'Shuffling...' : '⚙️ Re-shuffle Buckets'}</span>
            </button>
          )}

          {isRotationActive && onDeactivateRotation && (
            <button
              type="button"
              disabled={rotating}
              onClick={handleDeactivateRotation}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 shadow-paper-sm transition-all active:scale-95 disabled:opacity-50"
              title="Pause chore rotation and release duties to Up-for-Grabs"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>⏸️ Pause Rotation</span>
            </button>
          )}

          {onCreateChore && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chore</span>
            </button>
          )}

          <button
            type="button"
            disabled={togglingAway}
            onClick={handleAwayToggle}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-bold transition border shadow-paper-sm active:scale-95 ${
              isAway
                ? 'bg-accent-slate hover:bg-[#1E334A] text-white border-accent-slate'
                : 'bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 border-stone-300 dark:border-slate-600'
            }`}
          >
            {isAway ? (
              <>
                <Sun className="w-4 h-4" />
                <span>{togglingAway ? 'Updating...' : 'I Am Back (Active)'}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-accent-slate dark:text-slate-400" />
                <span>{togglingAway ? 'Updating...' : 'Set Away'}</span>
              </>
            )}
          </button>
        </div>
      </PaperCard>

      {/* Paused Rotation Banner */}
      {!isRotationActive && (
        <PaperCard variant="card" className="p-6 text-center space-y-3 bg-stone-50/50 dark:bg-slate-800/60 border border-dashed border-border-stone dark:border-slate-700">
          <div className="text-3xl">🎲</div>
          <h3 className="text-lg font-sans font-bold text-ink-navy dark:text-slate-100">
            Chore rotation is currently paused. Chores are available in the Up-for-Grabs pool.
          </h3>
          <p className="text-xs text-ink-graphite dark:text-slate-400 max-w-md mx-auto font-sans">
            Distribute all household chores into balanced effort buckets and automatically rotate weekly assignments among active roommates.
          </p>
          {onActivateRotation && (
            <div className="pt-2">
              <button
                type="button"
                disabled={rotating}
                onClick={handleActivateRotation}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${rotating ? 'animate-spin' : ''}`} />
                <span>{rotating ? 'Distributing...' : '🎲 Distribute into Buckets & Start Rotation'}</span>
              </button>
            </div>
          )}
        </PaperCard>
      )}

      {/* My Duties Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200/80 dark:border-slate-700/80">
          <h3 className="text-xl font-sans font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
            <IdentitySticker name={currentMember.nickname} size="sm" />
            <span>My Duties ({currentMember.nickname})</span>
          </h3>
          <span className="font-sans font-semibold text-xs text-ink-graphite dark:text-slate-300 bg-stone-100 dark:bg-slate-700 px-2.5 py-0.5 rounded border border-border-stone dark:border-slate-600">
            {myAssignments.filter((a) => a.status === 'completed').length} / {myAssignments.length} done
          </span>
        </div>

        {myAssignments.length === 0 ? (
          <PaperCard variant="card" className="p-6 text-center text-sm font-sans text-ink-muted dark:text-slate-400 border-dashed border-2 border-stone-300 dark:border-slate-700">
            No duties assigned to you for this week.
          </PaperCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map((assignment, idx) => (
              <PaperCard
                key={assignment.id}
                variant="card"
                tilt={idx % 2 === 0 ? 'left' : 'right'}
                className={`p-5 flex flex-col justify-between transition border ${
                  assignment.status === 'completed'
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-stone-200/80 dark:border-slate-700/80 hover:border-accent-slate/50 shadow-paper-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ScribbleCheckbox
                        checked={assignment.status === 'completed'}
                        disabled={completingId === assignment.id}
                        onChange={(nextChecked) => {
                          if (nextChecked) {
                            handleComplete(assignment.id);
                          } else {
                            handleUncomplete(assignment.id);
                          }
                        }}
                        label={
                          <span className="font-sans font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                            {assignment.chore.title}
                          </span>
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onEditChore && (
                        <button
                          type="button"
                          onClick={() => onEditChore(assignment.chore)}
                          className="p-1 rounded text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                          title="Edit Chore"
                          aria-label={`Edit ${assignment.chore.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteChore && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete "${assignment.chore.title}"?`)) {
                              soundEngine.playEraserSound();
                              await onDeleteChore(assignment.chore.id);
                            }
                          }}
                          className="p-1 rounded text-ink-muted hover:text-stamp-dirty dark:text-slate-400 dark:hover:text-red-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                          title="Delete Chore"
                          aria-label={`Delete ${assignment.chore.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs border border-border-stone dark:border-slate-700 shadow-sm">
                        <Star className="w-3 h-3 fill-accent-slate text-accent-slate" />
                        {assignment.chore.effort_weight} pts
                      </span>
                    </div>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-ink-graphite dark:text-slate-400 mb-3 font-sans">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <IdentitySticker name={currentMember.nickname} size="sm" />
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-border-stone dark:border-slate-600">
                      {assignment.chore.completion_type === 'single_weekly'
                        ? 'Weekly check-off'
                        : 'Continuous duty'}
                    </span>
                    {assignment.status === 'completed' && (
                      <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-stamp-clean dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Continuous duty tally counter */}
                  {assignment.chore.completion_type === 'continuous_duty' && (
                    <div className="my-2 p-2 bg-paper-sheet dark:bg-[#1A2234] rounded border border-stone-200/80 dark:border-slate-700">
                      <TallyCounter
                        count={assignment.duty_instances_count || (assignment.status === 'completed' ? 1 : 0)}
                        label="instances"
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-stone-200/80 dark:border-slate-700/80">
                    {assignment.chore.completion_type === 'single_weekly' ? (
                      assignment.status === 'completed' ? (
                        <button
                          type="button"
                          disabled={completingId === assignment.id}
                          onClick={() => handleUncomplete(assignment.id)}
                          className="flex-1 min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 font-sans font-semibold text-xs rounded-lg border border-border-stone dark:border-slate-700 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                          title="Undo chore completion"
                          aria-label="Undo chore completion"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{completingId === assignment.id ? 'Undoing...' : 'Undo / Uncheck'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={completingId === assignment.id}
                          onClick={() => handleComplete(assignment.id)}
                          className="flex-1 min-h-[44px] py-2 px-3 bg-accent-sage hover:bg-emerald-700 text-white font-sans font-bold text-sm rounded-lg shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{completingId === assignment.id ? 'Marking...' : 'Mark Done'}</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveLogAssignment(assignment)}
                        className="flex-1 min-h-[44px] py-2 px-3 bg-accent-sage hover:bg-emerald-700 text-white font-sans font-bold text-sm rounded-lg shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] hover:shadow-[0_3px_0_rgba(30,35,43,0.15)] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Log Duty</span>
                      </button>
                    )}

                    {!isRotationActive && onUnclaimChore && assignment.status === 'pending' && (
                      <button
                        type="button"
                        disabled={unclaimingId === assignment.id}
                        onClick={() => handleUnclaim(assignment.id)}
                        className="min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-ink-navy dark:text-slate-200 font-sans font-semibold text-xs rounded-lg border border-stone-300 dark:border-slate-500 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                        title="Release chore back to Up-for-Grabs pool"
                        aria-label="Release or Unclaim Chore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{unclaimingId === assignment.id ? 'Releasing...' : '↩️ Release / Unclaim'}</span>
                      </button>
                    )}

                    {onOpenSwap && assignment.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onOpenSwap(assignment)}
                        className="min-h-[44px] py-2 px-3 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-ink-navy dark:text-slate-200 font-sans font-bold text-sm rounded-lg border border-border-stone dark:border-slate-500 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
                        title="Swap chore with roommate"
                        aria-label="Swap Chore"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Swap</span>
                      </button>
                    )}
                  </div>

                  {/* Reassignment Control */}
                  {onReassignChore && activeMembers.length > 1 && (
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-200/60 dark:border-slate-700/60">
                      <label
                        htmlFor={`reassign-my-${assignment.id}`}
                        className="text-[11px] font-sans font-semibold text-ink-graphite dark:text-slate-400 shrink-0"
                      >
                        Reassign:
                      </label>
                      <select
                        id={`reassign-my-${assignment.id}`}
                        aria-label={`Reassign ${assignment.chore.title}`}
                        value={assignment.member_id || currentMember.id}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          if (targetId && targetId !== assignment.member_id) {
                            handleReassign(assignment.id, targetId);
                          }
                        }}
                        className="w-full py-1 px-2 text-xs font-sans bg-paper-card dark:bg-[#222D42] text-ink-navy dark:text-slate-200 border border-stone-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-accent-slate cursor-pointer"
                      >
                        {activeMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id === currentMember.id ? `${m.nickname} (Me)` : m.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </PaperCard>
            ))}
          </div>
        )}
      </div>

      {/* Roommates' Duties Section */}
      {Array.from(otherMembersMap.values()).map(({ member, assignments: memberAssignments }) => (
        <div key={member.id} className="space-y-4 pt-4 border-t border-stone-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xl font-sans font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
              <IdentitySticker name={member.nickname} size="sm" />
              <span>{member.nickname}'s Duties</span>
              {member.status === 'away' && (
                <span className="px-2 py-0.5 rounded text-xs font-sans font-semibold uppercase bg-stone-100 dark:bg-slate-800 text-accent-slate dark:text-slate-300 border border-border-stone dark:border-slate-700">
                  Away
                </span>
              )}
            </h3>
            <span className="font-sans font-semibold text-xs text-ink-graphite dark:text-slate-300 bg-stone-100 dark:bg-slate-700 px-2.5 py-0.5 rounded border border-border-stone dark:border-slate-600">
              {memberAssignments.filter((a) => a.status === 'completed').length} / {memberAssignments.length} done
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberAssignments.map((assignment, idx) => (
              <PaperCard
                key={assignment.id}
                variant="card"
                tilt={idx % 2 === 0 ? 'right' : 'left'}
                className="p-4 flex flex-col justify-between border border-stone-200/80 dark:border-slate-700/80 shadow-paper-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <ScribbleCheckbox
                        checked={assignment.status === 'completed'}
                        disabled={true}
                        label={
                          <span className="font-sans font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                            {assignment.chore.title}
                          </span>
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onEditChore && (
                        <button
                          type="button"
                          onClick={() => onEditChore(assignment.chore)}
                          className="p-1 rounded text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                          title="Edit Chore"
                          aria-label={`Edit ${assignment.chore.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteChore && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete "${assignment.chore.title}"?`)) {
                              soundEngine.playEraserSound();
                              await onDeleteChore(assignment.chore.id);
                            }
                          }}
                          className="p-1 rounded text-ink-muted hover:text-stamp-dirty dark:text-slate-400 dark:hover:text-red-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                          title="Delete Chore"
                          aria-label={`Delete ${assignment.chore.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs border border-border-stone dark:border-slate-700 shadow-sm shrink-0">
                        <Star className="w-3 h-3 text-accent-slate fill-accent-slate" />
                        {assignment.chore.effort_weight} pts
                      </span>
                    </div>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-ink-graphite dark:text-slate-400 mb-2 font-sans">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <IdentitySticker name={member.nickname} size="sm" />
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-border-stone dark:border-slate-600">
                      {assignment.chore.completion_type === 'single_weekly'
                        ? 'Weekly check-off'
                        : 'Continuous duty'}
                    </span>
                    {assignment.status === 'completed' && (
                      <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-stamp-clean dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>

                  {assignment.chore.completion_type === 'continuous_duty' && (
                    <div className="my-2 p-2 bg-paper-sheet dark:bg-[#1A2234] rounded border border-stone-200/80 dark:border-slate-700">
                      <TallyCounter
                        count={assignment.duty_instances_count || (assignment.status === 'completed' ? 1 : 0)}
                        label="instances"
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  {assignment.chore.completion_type === 'continuous_duty' && (
                    <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => setActiveLogAssignment(assignment)}
                        className="w-full min-h-[44px] py-2 px-3 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs rounded-lg border border-stone-300 dark:border-slate-600 shadow-[0_2px_0_rgba(30,35,43,0.12)] hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-accent-slate focus-visible:outline-none active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Log Instance</span>
                      </button>
                    </div>
                  )}

                  {/* Reassignment Control for Roommates */}
                  {onReassignChore && activeMembers.length > 1 && (
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-200/60 dark:border-slate-700/60">
                      <label
                        htmlFor={`reassign-roommate-${assignment.id}`}
                        className="text-[11px] font-sans font-semibold text-ink-graphite dark:text-slate-400 shrink-0"
                      >
                        Reassign:
                      </label>
                      <select
                        id={`reassign-roommate-${assignment.id}`}
                        aria-label={`Reassign ${assignment.chore.title}`}
                        value={assignment.member_id || ''}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          if (targetId && targetId !== assignment.member_id) {
                            handleReassign(assignment.id, targetId);
                          }
                        }}
                        className="w-full py-1 px-2 text-xs font-sans bg-paper-card dark:bg-[#222D42] text-ink-navy dark:text-slate-200 border border-stone-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-accent-slate cursor-pointer"
                      >
                        {activeMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id === currentMember.id ? `${m.nickname} (Me)` : m.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </PaperCard>
            ))}
          </div>
        </div>
      ))}

      {/* Log Modal */}
      {activeLogAssignment && (
        <ChoreLogModal
          assignment={activeLogAssignment}
          onClose={() => setActiveLogAssignment(null)}
          onSubmitLog={onLogDuty}
        />
      )}

      {/* Create Chore Modal */}
      {showCreateModal && onCreateChore && (
        <CreateChoreModal
          onClose={() => setShowCreateModal(false)}
          onCreateChore={onCreateChore}
        />
      )}
    </div>
  );
}
