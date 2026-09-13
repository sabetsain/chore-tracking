import { useState, useMemo } from 'react';
import {
  Plus,
  Moon,
  Sun,
  RotateCcw,
  Shuffle,
  Pause,
} from 'lucide-react';
import { Chore, ChoreAssignment, ChoreCompletionType, Household, Member } from '../types';
import { ChoreLogModal } from './ChoreLogModal';
import { CreateChoreModal } from './CreateChoreModal';
import { PaperCard } from './stationery/PaperCard';
import { IdentitySticker } from './stationery/IdentitySticker';
import { soundEngine } from '../utils/soundEngine';
import { ChoreCard } from './ChoreCard';
import { ChoreDomain } from '../hooks/useChores';
import { useAuth } from '../context/AuthContext';

export interface ChoreDutyViewProps {
  currentMember?: Member;
  household?: Household;
  chores?: ChoreDomain;
  assignments?: ChoreAssignment[];
  onCompleteChore?: (assignmentId: string) => Promise<void>;
  onUncompleteChore?: (assignmentId: string) => Promise<void>;
  onReassignChore?: (assignmentId: string, memberId: string) => Promise<void>;
  onLogDuty?: (assignmentId: string, note?: string) => Promise<void>;
  onToggleAway?: (status: 'active' | 'away') => Promise<void>;
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

function ChoreDutyViewInner({
  currentMember,
  household,
  chores,
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
}: ChoreDutyViewProps & { currentMember: Member }) {
  const [activeLogAssignment, setActiveLogAssignment] = useState<ChoreAssignment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [togglingAway, setTogglingAway] = useState<boolean>(false);
  const [rotating, setRotating] = useState<boolean>(false);

  const isRotationActive = household?.chore_rotation_active ?? false;

  const assignmentList = assignments ?? (chores ? chores.assignments : []);
  const handleComplete = onCompleteChore ?? (chores ? chores.completeChore : async () => {});
  const handleUncomplete = onUncompleteChore ?? (chores ? chores.uncompleteChore : undefined);
  const handleReassign = onReassignChore ?? (chores ? chores.reassignChore : undefined);
  const handleUnclaim = onUnclaimChore ?? (chores ? chores.unclaimChore : undefined);
  const handleDelete = onDeleteChore ?? (chores ? chores.deleteChore : undefined);
  const handleCreate = onCreateChore ?? (chores ? chores.createChore : undefined);
  const handleActivateRotation = onActivateRotation ?? (chores ? chores.activateRotation : undefined);
  const handleDeactivateRotation = onDeactivateRotation ?? (chores ? chores.deactivateRotation : undefined);
  const handleReshuffleRotation = onReshuffleRotation ?? (chores ? chores.reshuffleRotation : undefined);
  const handleLog = onLogDuty ?? (chores ? chores.logDuty : async () => {});

  // Derive active members for reassignment
  const activeMembersList = useMemo(() => {
    const memberMap = new Map<string, Member>();
    if (allMembers && allMembers.length > 0) {
      allMembers.forEach((m) => memberMap.set(m.id, m));
    } else {
      if (currentMember) memberMap.set(currentMember.id, currentMember);
      assignmentList.forEach((a) => {
        if (a.member) memberMap.set(a.member.id, a.member);
      });
    }
    return Array.from(memberMap.values()).filter((m) => m.status === 'active');
  }, [allMembers, assignmentList, currentMember]);

  // Group assignments by member
  const myAssignments = assignmentList.filter((a) => a.member_id === currentMember.id);
  const otherMembersMap = new Map<string, { member: Member; assignments: ChoreAssignment[] }>();

  assignmentList.forEach((a) => {
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

  const handleAwayToggle = async () => {
    if (!onToggleAway) return;
    setTogglingAway(true);
    try {
      const nextStatus = currentMember.status === 'active' ? 'away' : 'active';
      await onToggleAway(nextStatus);
    } finally {
      setTogglingAway(false);
    }
  };

  const handleActivateRotationClick = async () => {
    if (!handleActivateRotation) return;
    setRotating(true);
    try {
      soundEngine.playPencilScribbleSound();
      await handleActivateRotation();
    } finally {
      setRotating(false);
    }
  };

  const handleDeactivateRotationClick = async () => {
    if (!handleDeactivateRotation) return;
    setRotating(true);
    try {
      soundEngine.playEraserSound();
      await handleDeactivateRotation();
    } finally {
      setRotating(false);
    }
  };

  const handleReshuffleRotationClick = async () => {
    if (!handleReshuffleRotation) return;
    setRotating(true);
    try {
      soundEngine.playPencilScribbleSound();
      await handleReshuffleRotation();
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
          {isRotationActive && handleReshuffleRotation && (
            <button
              type="button"
              disabled={rotating}
              onClick={handleReshuffleRotationClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 shadow-paper-sm transition-all active:scale-95 disabled:opacity-50"
              title="Re-distribute chores across buckets"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{rotating ? 'Shuffling...' : '⚙️ Re-shuffle Buckets'}</span>
            </button>
          )}

          {isRotationActive && handleDeactivateRotation && (
            <button
              type="button"
              disabled={rotating}
              onClick={handleDeactivateRotationClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 shadow-paper-sm transition-all active:scale-95 disabled:opacity-50"
              title="Pause chore rotation and release duties to Up-for-Grabs"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>⏸️ Pause Rotation</span>
            </button>
          )}

          {handleCreate && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chore</span>
            </button>
          )}

          {onToggleAway && (
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
          )}
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
          {handleActivateRotation && (
            <div className="pt-2">
              <button
                type="button"
                disabled={rotating}
                onClick={handleActivateRotationClick}
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
              <ChoreCard
                key={assignment.id}
                variant="mine"
                assignment={assignment}
                currentMember={currentMember}
                allMembers={activeMembersList}
                isRotationActive={isRotationActive}
                onComplete={handleComplete}
                onUncomplete={handleUncomplete}
                onLogDuty={(asg) => setActiveLogAssignment(asg)}
                onUnclaim={handleUnclaim}
                onSwap={onOpenSwap}
                onReassign={handleReassign}
                onEdit={onEditChore}
                onDelete={handleDelete}
                tilt={idx % 2 === 0 ? 'left' : 'right'}
              />
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
              <ChoreCard
                key={assignment.id}
                variant="roommate"
                assignment={assignment}
                currentMember={currentMember}
                allMembers={activeMembersList}
                isRotationActive={isRotationActive}
                onLogDuty={(asg) => setActiveLogAssignment(asg)}
                onReassign={handleReassign}
                onEdit={onEditChore}
                onDelete={handleDelete}
                tilt={idx % 2 === 0 ? 'right' : 'left'}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Log Modal */}
      {activeLogAssignment && (
        <ChoreLogModal
          assignment={activeLogAssignment}
          onClose={() => setActiveLogAssignment(null)}
          onSubmitLog={handleLog}
        />
      )}

      {/* Create Chore Modal */}
      {showCreateModal && handleCreate && (
        <CreateChoreModal
          onClose={() => setShowCreateModal(false)}
          onCreateChore={handleCreate}
        />
      )}
    </div>
  );
}

function ChoreDutyViewWithAuth(props: ChoreDutyViewProps) {
  const { member } = useAuth();
  if (!member) return null;
  return <ChoreDutyViewInner {...props} currentMember={member} />;
}

export function ChoreDutyView(props: ChoreDutyViewProps) {
  if (!props.currentMember) {
    return <ChoreDutyViewWithAuth {...props} />;
  }
  return <ChoreDutyViewInner {...props} currentMember={props.currentMember} />;
}

export default ChoreDutyView;
