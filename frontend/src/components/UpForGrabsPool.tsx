import { useState } from 'react';
import { Sparkles, Hand, Star, Moon, AlertCircle } from 'lucide-react';
import { ChoreAssignment } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { WashiTape } from './stationery/WashiTape';
import { soundEngine } from '../utils/soundEngine';

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
      <PaperCard variant="card" className="p-8 text-center border-dashed border-2 border-slate-300 dark:border-slate-700">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
        <h3 className="text-xl font-hand font-bold text-ink-navy dark:text-slate-100">No Chores Up for Grabs</h3>
        <p className="text-xs text-ink-muted dark:text-slate-400 mt-1 font-body">
          All chores are currently assigned to active roommates!
        </p>
      </PaperCard>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <h3 className="text-2xl font-hand font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Up for Grabs Pool</span>
          </h3>
          <p className="text-xs text-ink-graphite dark:text-slate-400 font-body">
            Pinned sticky memo notes: unassigned tasks and chores from roommates currently marked Away.
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-hand font-bold border border-amber-300 dark:border-amber-700 shadow-sm">
          {chores.length} Available
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-hand">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {chores.map((assignment, idx) => {
          const isAwayMember = assignment.member && assignment.member.status === 'away';
          const tapeColor = idx % 3 === 0 ? 'yellow' : idx % 3 === 1 ? 'green' : 'orange';
          const tilt = idx % 2 === 0 ? -1.5 : 1.5;

          return (
            <div key={assignment.id} className="relative pt-2">
              <WashiTape color={tapeColor} tilt={tilt} width="w-24" />
              <PaperCard
                variant={idx % 2 === 0 ? 'postit' : 'manila'}
                className="p-5 min-h-[220px] flex flex-col justify-between border border-amber-300 dark:border-slate-600 shadow-paper-md hover:shadow-paper-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                    <h4 className="font-hand font-bold text-xl text-ink-navy dark:text-slate-100 leading-tight">
                      {assignment.chore.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 font-hand font-bold text-xs border border-amber-300/80 shadow-sm shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      {assignment.chore.effort_weight} pts
                    </span>
                  </div>

                  {assignment.chore.description && (
                    <p className="text-xs text-ink-graphite dark:text-slate-400 mb-3 font-body">
                      {assignment.chore.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {isAwayMember ? (
                      <span className="inline-flex items-center gap-1 text-xs font-hand font-bold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        <Moon className="w-3 h-3" />
                        {assignment.member!.nickname} (Away)
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-paper-card dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                        Unassigned
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-paper-card dark:bg-slate-700 text-ink-graphite dark:text-slate-300 border border-slate-300 dark:border-slate-600">
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
                  className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white text-sm font-hand font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <Hand className="w-4 h-4" />
                  <span>{claimingId === assignment.id ? 'Claiming...' : 'Claim Chore'}</span>
                </button>
              </PaperCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
