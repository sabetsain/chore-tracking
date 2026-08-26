import React, { useState } from 'react';
import { X, ArrowLeftRight, Star, AlertCircle, Check } from 'lucide-react';
import { ChoreAssignment } from '../types';

interface ChoreSwapModalProps {
  sourceAssignment: ChoreAssignment;
  availableTargets: ChoreAssignment[];
  onClose: () => void;
  onSwap: (sourceAssignmentId: string, targetAssignmentId: string) => Promise<void>;
}

export function ChoreSwapModal({
  sourceAssignment,
  availableTargets,
  onClose,
  onSwap,
}: ChoreSwapModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    availableTargets[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;
    setLoading(true);
    setError(null);
    try {
      await onSwap(sourceAssignment.id, selectedTargetId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to swap chores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Swap Chore Assignment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source chore */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Your Current Chore
            </label>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-950">
                  {sourceAssignment.chore.title}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                  {sourceAssignment.chore.effort_weight} pts
                </span>
              </div>
            </div>
          </div>

          {/* Target chore selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Roommate's Chore to Swap With
            </label>

            {availableTargets.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center">
                No other pending chores available to swap with this week.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableTargets.map((target) => {
                  const isSelected = selectedTargetId === target.id;
                  return (
                    <div
                      key={target.id}
                      onClick={() => setSelectedTargetId(target.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {target.chore.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Assigned to:{' '}
                          <span className="font-medium text-slate-700">
                            {target.member ? target.member.nickname : 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {target.chore.effort_weight} pts
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableTargets.length === 0}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{loading ? 'Swapping...' : 'Confirm Swap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
