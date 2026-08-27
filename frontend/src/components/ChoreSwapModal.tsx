import React, { useState } from 'react';
import { X, ArrowLeftRight, Star, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChoreAssignment } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { PaperclipFastener } from './stationery/PaperclipFastener';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative max-w-md w-full"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <PaperclipFastener position="top-left" />
        </motion.div>
        <PaperCard
          variant="manila"
          className="-rotate-1 p-6 shadow-paper-lifted border border-amber-300/80 dark:border-slate-600"
        >
          <div className="flex items-center justify-between pb-3 border-b border-amber-300/60 dark:border-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
              <h3 className="font-serif font-bold text-2xl text-ink-navy dark:text-slate-100">
                Swap Chore Assignment
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-amber-200/50 dark:hover:bg-slate-700 transition"
              aria-label="Close Swap Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Source chore */}
            <div>
              <label className="block text-xs font-bold text-ink-graphite dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">
                Your Current Chore
              </label>
              <div className="p-3.5 bg-paper-sheet dark:bg-[#1A2234] border border-amber-300/70 dark:border-slate-700 rounded-lg shadow-paper-sm">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-ink-navy dark:text-slate-100">
                    {sourceAssignment.chore.title}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 text-xs font-sans font-bold border border-amber-300/80 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    {sourceAssignment.chore.effort_weight} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Target chore selector */}
            <div>
              <label className="block text-xs font-bold text-ink-graphite dark:text-slate-400 uppercase tracking-wider mb-2 font-sans">
                Select Roommate's Chore to Swap With
              </label>

              {availableTargets.length === 0 ? (
                <p className="text-xs font-sans text-ink-muted dark:text-slate-400 p-4 bg-paper-sheet dark:bg-[#1A2234] rounded-lg text-center border border-dashed border-stone-300 dark:border-slate-700">
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
                        className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between shadow-paper-sm ${
                          isSelected
                            ? 'border-indigo-600 bg-paper-sheet dark:bg-[#1A2234] ring-2 ring-indigo-500/40'
                            : 'border-amber-200 dark:border-slate-700 hover:border-amber-400 bg-paper-sheet/80 dark:bg-[#1A2234]/80'
                        }`}
                      >
                        <div>
                          <div className="font-serif font-bold text-base text-ink-navy dark:text-slate-100">
                            {target.chore.title}
                          </div>
                          <div className="text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                            Assigned to:{' '}
                            <span className="font-sans font-semibold text-ink-navy dark:text-slate-200 text-xs">
                              {target.member ? target.member.nickname : 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-highlighter-yellow text-amber-950 text-xs font-sans font-bold border border-amber-300/80">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                            {target.chore.effort_weight} pts
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center text-white shadow-sm">
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

            <div className="flex gap-2 pt-3 border-t border-amber-300/60 dark:border-slate-600">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-amber-100/60 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || availableTargets.length === 0}
                className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{loading ? 'Swapping...' : 'Confirm Swap'}</span>
              </button>
            </div>
          </form>
        </PaperCard>
      </motion.div>
    </motion.div>
  );
}
