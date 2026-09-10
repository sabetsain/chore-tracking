import React, { useState } from 'react';
import { X, Plus, AlertCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChoreCompletionType } from '../types';
import { PaperCard } from './stationery/PaperCard';

interface CreateChoreModalProps {
  onClose: () => void;
  onCreateChore: (data: {
    title: string;
    description?: string;
    effort_weight: number;
    completion_type: ChoreCompletionType;
  }) => Promise<void>;
}

export function CreateChoreModal({ onClose, onCreateChore }: CreateChoreModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effortWeight, setEffortWeight] = useState<number>(2);
  const [completionType, setCompletionType] = useState<ChoreCompletionType>('single_weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onCreateChore({
        title: title.trim(),
        description: description.trim() || undefined,
        effort_weight: effortWeight,
        completion_type: completionType,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create chore');
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
        <PaperCard
          variant="sheet"
          className="rotate-1 p-6 shadow-paper-lifted border border-stone-300 dark:border-slate-700"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-700 mb-4">
            <div>
              <h3 className="font-serif font-bold text-2xl text-ink-navy dark:text-slate-100">
                Add New Chore
              </h3>
              <p className="text-xs font-sans text-ink-graphite dark:text-slate-400 mt-0.5">
                Register a shared household responsibility to the ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              aria-label="Close Add Chore Modal"
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
            <div>
              <label htmlFor="chore-title" className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                Chore Title
              </label>
              <input
                id="chore-title"
                type="text"
                required
                placeholder="e.g. Deep Clean Oven or Water Houseplants"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
              />
            </div>

            <div>
              <label htmlFor="chore-description" className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                Description <span className="font-normal text-ink-muted dark:text-slate-400">(optional)</span>
              </label>
              <textarea
                id="chore-description"
                rows={2}
                placeholder="Brief instructions or checklist details for roommates"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1.5 font-sans">
                Effort Weight (1 - 5 Points)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((pts) => {
                  const isSelected = effortWeight === pts;
                  return (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setEffortWeight(pts)}
                      className={`flex-1 py-2 px-1 rounded-lg text-xs font-sans font-bold border transition flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-accent-slate text-white border-accent-slate shadow-sm'
                          : 'bg-paper-card dark:bg-[#222D42] border-stone-300 dark:border-slate-600 text-ink-graphite dark:text-slate-300 hover:border-accent-slate/50'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'text-ink-muted'}`} />
                      <span>{pts} pt{pts > 1 ? 's' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1.5 font-sans">
                Duty Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompletionType('single_weekly')}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    completionType === 'single_weekly'
                      ? 'bg-stone-100 dark:bg-slate-800 border-accent-slate ring-1 ring-accent-slate'
                      : 'bg-paper-card dark:bg-[#222D42] border-stone-300 dark:border-slate-600 hover:border-accent-slate/50'
                  }`}
                >
                  <span className="font-serif font-bold text-xs text-ink-navy dark:text-slate-100">
                    Weekly Check-Off
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-slate-400 mt-0.5 font-sans leading-tight">
                    Completed once per weekly rotation cycle.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompletionType('continuous_duty')}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    completionType === 'continuous_duty'
                      ? 'bg-stone-100 dark:bg-slate-800 border-accent-slate ring-1 ring-accent-slate'
                      : 'bg-paper-card dark:bg-[#222D42] border-stone-300 dark:border-slate-600 hover:border-accent-slate/50'
                  }`}
                >
                  <span className="font-serif font-bold text-xs text-ink-navy dark:text-slate-100">
                    Continuous Duty
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-slate-400 mt-0.5 font-sans leading-tight">
                    Logged as ongoing tally instances (e.g. trash).
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-slate-100 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Adding...' : 'Save Chore'}</span>
              </button>
            </div>
          </form>
        </PaperCard>
      </motion.div>
    </motion.div>
  );
}
