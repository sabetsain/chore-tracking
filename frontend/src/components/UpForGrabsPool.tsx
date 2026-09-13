import { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Chore, ChoreAssignment } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { ChoreCard } from './ChoreCard';
import { ChoreDomain, useChores } from '../hooks/useChores';

export interface UpForGrabsPoolProps {
  chores?: ChoreDomain | ChoreAssignment[];
  onClaimChore?: (assignmentId: string) => Promise<void>;
  onEditChore?: (chore: Chore) => void;
  onDeleteChore?: (choreId: string) => Promise<void>;
}

function UpForGrabsPoolView({
  chores,
  onClaimChore,
  onEditChore,
  onDeleteChore,
}: UpForGrabsPoolProps) {
  const [error, setError] = useState<string | null>(null);

  const isDomain = chores && !Array.isArray(chores) && 'upForGrabs' in chores;
  const choreDomain = isDomain ? (chores as ChoreDomain) : null;

  const choreList: ChoreAssignment[] = choreDomain
    ? choreDomain.upForGrabs
    : Array.isArray(chores)
    ? chores
    : [];

  const handleClaim = async (assignmentId: string) => {
    setError(null);
    try {
      if (onClaimChore) {
        await onClaimChore(assignmentId);
      } else if (choreDomain) {
        await choreDomain.claimChore(assignmentId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to claim chore');
    }
  };

  const handleDelete = onDeleteChore ?? (choreDomain ? choreDomain.deleteChore : undefined);

  if (choreList.length === 0) {
    return (
      <PaperCard variant="card" className="p-8 text-center border-dashed border-2 border-stone-300 dark:border-slate-700 bg-[#FDFAF6] dark:bg-[#1F1D1A]">
        <Sparkles className="w-8 h-8 text-accent-slate mx-auto mb-2 opacity-80" />
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
            <Sparkles className="w-5 h-5 text-accent-slate" />
            <span>Up for Grabs Pool</span>
          </h3>
          <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans mt-0.5">
            Open chores and duties available to be claimed by active roommates.
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-accent-slate dark:text-slate-200 text-xs font-sans font-bold border border-border-stone dark:border-slate-700 shadow-sm">
          {choreList.length} Available
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {choreList.map((assignment, idx) => (
          <ChoreCard
            key={assignment.id}
            variant="pool"
            assignment={assignment}
            onClaim={handleClaim}
            onEdit={onEditChore}
            onDelete={handleDelete}
            tilt={idx % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </div>
  );
}

function UpForGrabsPoolConnected(props: UpForGrabsPoolProps) {
  const chores = useChores();
  return <UpForGrabsPoolView chores={chores} {...props} />;
}

export function UpForGrabsPool(props: UpForGrabsPoolProps) {
  if (!props.chores) {
    return <UpForGrabsPoolConnected {...props} />;
  }
  return <UpForGrabsPoolView {...props} />;
}

export default UpForGrabsPool;
