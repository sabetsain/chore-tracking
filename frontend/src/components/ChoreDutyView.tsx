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

  const handleComplete = async (assignmentId: string) => {
    setCompletingId(assignmentId);
    try {
      await onCompleteChore(assignmentId);
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

  const isAway = currentMember.status === 'away';

  return (
    <div className="space-y-6">
      {/* Top Banner / Member Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Weekly Chore Duties</h2>
            {isAway && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                Away
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAway
              ? 'You are currently marked as Away. Your chores are up for grabs.'
              : 'Complete your weekly chores or log continuous duty instances.'}
          </p>
        </div>

        <button
          type="button"
          disabled={togglingAway}
          onClick={handleAwayToggle}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border shadow-sm ${
            isAway
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          {isAway ? (
            <>
              <Sun className="w-4 h-4" />
              <span>{togglingAway ? 'Updating...' : 'I Am Back (Active)'}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-500" />
              <span>{togglingAway ? 'Updating...' : 'Set Away'}</span>
            </>
          )}
        </button>
      </div>

      {/* My Duties Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>My Duties ({currentMember.nickname})</span>
          </h3>
          <span className="text-xs text-slate-400">
            {myAssignments.filter((a) => a.status === 'completed').length} / {myAssignments.length} done
          </span>
        </div>

        {myAssignments.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No duties assigned to you for this week.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition ${
                  assignment.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {assignment.chore.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                        <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                        {assignment.chore.effort_weight} pts
                      </span>
                    </div>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-slate-500 mb-3">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {assignment.chore.completion_type === 'single_weekly'
                        ? 'Weekly check-off'
                        : 'Continuous duty'}
                    </span>
                    {assignment.status === 'completed' && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {assignment.chore.completion_type === 'single_weekly' ? (
                    assignment.status === 'completed' ? (
                      <div className="flex-1 py-2 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                        Done for this week
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={completingId === assignment.id}
                        onClick={() => handleComplete(assignment.id)}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{completingId === assignment.id ? 'Marking...' : 'Mark Done'}</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveLogAssignment(assignment)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Log Duty</span>
                    </button>
                  )}

                  {onOpenSwap && assignment.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onOpenSwap(assignment)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                      title="Swap chore with roommate"
                      aria-label="Swap Chore"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Swap</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roommates' Duties Section */}
      {Array.from(otherMembersMap.values()).map(({ member, assignments: memberAssignments }) => (
        <div key={member.id} className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>{member.nickname}'s Duties</span>
              {member.status === 'away' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold bg-amber-100 text-amber-800">
                  Away
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400">
              {memberAssignments.filter((a) => a.status === 'completed').length} / {memberAssignments.length} done
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {assignment.chore.title}
                    </h4>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {assignment.chore.effort_weight} pts
                    </span>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-slate-500 mb-2">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {assignment.chore.completion_type === 'single_weekly'
                        ? 'Weekly check-off'
                        : 'Continuous duty'}
                    </span>
                    {assignment.status === 'completed' && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {assignment.chore.completion_type === 'continuous_duty' && (
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveLogAssignment(assignment)}
                      className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Log Instance</span>
                    </button>
                  </div>
                )}
              </div>
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
