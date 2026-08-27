import { useState } from 'react';
import {
  CheckCircle,
  Plus,
  ArrowLeftRight,
  Moon,
  Sun,
  User,
  Star,
} from 'lucide-react';
import { ChoreAssignment, Member } from '../types';
import { ChoreLogModal } from './ChoreLogModal';
import { PaperCard } from './stationery/PaperCard';
import { ScribbleCheckbox } from './stationery/ScribbleCheckbox';
import { TallyCounter } from './stationery/TallyCounter';
import { soundEngine } from '../utils/soundEngine';
import { triggerPaperDustCelebration } from '../utils/confetti';

interface ChoreDutyViewProps {
  currentMember: Member;
  assignments: ChoreAssignment[];
  onCompleteChore: (assignmentId: string) => Promise<void>;
  onLogDuty: (assignmentId: string, note?: string) => Promise<void>;
  onToggleAway: (status: 'active' | 'away') => Promise<void>;
  onOpenSwap?: (assignment: ChoreAssignment) => void;
}

export function ChoreDutyView({
  currentMember,
  assignments,
  onCompleteChore,
  onLogDuty,
  onToggleAway,
  onOpenSwap,
}: ChoreDutyViewProps) {
  const [activeLogAssignment, setActiveLogAssignment] = useState<ChoreAssignment | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [togglingAway, setTogglingAway] = useState<boolean>(false);

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
      soundEngine.playPencilScribbleSound();
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

  const handleAwayToggle = async () => {
    setTogglingAway(true);
    try {
      const nextStatus = currentMember.status === 'active' ? 'away' : 'active';
      await onToggleAway(nextStatus);
    } finally {
      setTogglingAway(false);
    }
  };

  const isAway = currentMember.status === 'away';

  return (
    <div className="space-y-6 notebook-ruled-surface notebook-margin-guide p-4 sm:p-6 rounded-xl border border-stone-300 dark:border-slate-700">
      {/* Top Banner / Member Status */}
      <PaperCard variant="card" className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-200/80 dark:border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-navy dark:text-slate-100">Weekly Chore Duties</h2>
            {isAway && (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-sans font-semibold">
                Away
              </span>
            )}
          </div>
          <p className="text-xs text-ink-graphite dark:text-slate-400 mt-1 font-sans">
            {isAway
              ? 'You are currently marked as Away. Your chores are up for grabs.'
              : 'Complete your weekly chores or log continuous duty instances on the ledger.'}
          </p>
        </div>

        <button
          type="button"
          disabled={togglingAway}
          onClick={handleAwayToggle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-bold transition border shadow-paper-sm active:scale-95 ${
            isAway
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
              : 'bg-paper-card dark:bg-[#222D42] hover:bg-amber-100/60 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 border-stone-300 dark:border-slate-600'
          }`}
        >
          {isAway ? (
            <>
              <Sun className="w-4 h-4" />
              <span>{togglingAway ? 'Updating...' : 'I Am Back (Active)'}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{togglingAway ? 'Updating...' : 'Set Away'}</span>
            </>
          )}
        </button>
      </PaperCard>

      {/* My Duties Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-stone-200/80 dark:border-slate-700/80">
          <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            <span>My Duties ({currentMember.nickname})</span>
          </h3>
          <span className="font-sans font-semibold text-xs text-ink-graphite dark:text-slate-300 bg-amber-100/60 dark:bg-slate-700 px-2.5 py-0.5 rounded border border-amber-200/60 dark:border-slate-600">
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
                    : 'border-stone-200/80 dark:border-slate-700/80 hover:border-indigo-300 shadow-paper-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ScribbleCheckbox
                        checked={assignment.status === 'completed'}
                        disabled={assignment.status === 'completed' || completingId === assignment.id}
                        onChange={() => handleComplete(assignment.id)}
                        label={
                          <span className="font-serif font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                            {assignment.chore.title}
                          </span>
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 font-sans font-bold text-xs border border-amber-300/80 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
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
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-paper-manila dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-amber-200/80 dark:border-slate-600">
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

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 mt-2 border-t border-stone-200/80 dark:border-slate-700/80">
                  {assignment.chore.completion_type === 'single_weekly' ? (
                    assignment.status === 'completed' ? (
                      <div className="flex-1 py-2 text-center font-sans font-semibold text-xs text-stamp-clean bg-emerald-100/60 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-700">
                        Done for this week
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={completingId === assignment.id}
                        onClick={() => handleComplete(assignment.id)}
                        className="flex-1 py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-sans font-bold text-sm rounded-lg shadow-paper-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{completingId === assignment.id ? 'Marking...' : 'Mark Done'}</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveLogAssignment(assignment)}
                      className="flex-1 py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-sans font-bold text-sm rounded-lg shadow-paper-sm transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Log Duty</span>
                    </button>
                  )}

                  {onOpenSwap && assignment.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onOpenSwap(assignment)}
                      className="py-2 px-3 bg-paper-manila dark:bg-[#2C3952] hover:bg-amber-200/80 dark:hover:bg-slate-600 text-ink-navy dark:text-slate-200 font-sans font-bold text-sm rounded-lg border border-amber-300/80 dark:border-slate-500 shadow-paper-sm transition flex items-center gap-1 active:scale-95"
                      title="Swap chore with roommate"
                      aria-label="Swap Chore"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Swap</span>
                    </button>
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
            <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-ink-graphite dark:text-slate-400" />
              <span>{member.nickname}'s Duties</span>
              {member.status === 'away' && (
                <span className="px-2 py-0.5 rounded text-xs font-sans font-semibold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  Away
                </span>
              )}
            </h3>
            <span className="font-sans font-semibold text-xs text-ink-graphite dark:text-slate-300 bg-amber-100/60 dark:bg-slate-700 px-2.5 py-0.5 rounded border border-amber-200/60 dark:border-slate-600">
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
                    <h4 className="font-serif font-bold text-lg text-ink-navy dark:text-slate-100 leading-snug">
                      {assignment.chore.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 font-sans font-bold text-xs border border-amber-300/80 shadow-sm shrink-0">
                      <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                      {assignment.chore.effort_weight} pts
                    </span>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-ink-graphite dark:text-slate-400 mb-2 font-sans">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-paper-manila dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-amber-200/80 dark:border-slate-600">
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

                {assignment.chore.completion_type === 'continuous_duty' && (
                  <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => setActiveLogAssignment(assignment)}
                      className="w-full py-1.5 px-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-amber-100/60 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 font-sans font-bold text-xs rounded-lg border border-stone-300 dark:border-slate-600 transition flex items-center justify-center gap-1.5 shadow-paper-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Log Instance</span>
                    </button>
                  </div>
                )}
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
    </div>
  );
}
