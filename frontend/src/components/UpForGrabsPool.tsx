import { useState } from 'react';
import { Sparkles, Hand, Star, Moon, AlertCircle } from 'lucide-react';
import { ChoreAssignment } from '../types';

interface UpForGrabsPoolProps {
  chores: ChoreAssignment[];
  onClaimChore: (assignmentId: string) => Promise<void>;
}

export function UpForGrabsPool({ chores, onClaimChore }: UpForGrabsPoolProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async (assignmentId: string) => {
    setClaimingId(assignmentId);
    setError(null);
    try {
      await onClaimChore(assignmentId);
    } catch (err: any) {
      setError(err.message || 'Failed to claim chore');
    } finally {
      setClaimingId(null);
    }
  };

  if (chores.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">No Chores Up for Grabs</h3>
        <p className="text-xs text-slate-400 mt-1">
          All chores are assigned to active roommates!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Up for Grabs Pool</span>
          </h3>
          <p className="text-xs text-slate-500">
            Unassigned chores and chores from roommates currently marked Away.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          {chores.length} Available
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chores.map((assignment) => {
          const isAwayMember = assignment.member && assignment.member.status === 'away';

          return (
            <div
              key={assignment.id}
              className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {assignment.chore.title}
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {assignment.chore.effort_weight} pts
                  </span>
                </div>

                {assignment.chore.description && (
                  <p className="text-xs text-slate-500 mb-3">
                    {assignment.chore.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {isAwayMember ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      <Moon className="w-3 h-3" />
                      {assignment.member!.nickname} (Away)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Unassigned
                    </span>
                  )}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {assignment.chore.completion_type === 'single_weekly'
                      ? 'Weekly'
                      : 'Continuous'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={claimingId === assignment.id}
                onClick={() => handleClaim(assignment.id)}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Hand className="w-4 h-4" />
                <span>{claimingId === assignment.id ? 'Claiming...' : 'Claim Chore'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
