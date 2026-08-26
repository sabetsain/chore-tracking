import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { ChoreAssignment } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { PaperclipFastener } from './stationery/PaperclipFastener';

interface ChoreLogModalProps {
  assignment: ChoreAssignment;
  onClose: () => void;
  onSubmitLog: (assignmentId: string, note?: string) => Promise<void>;
}

export function ChoreLogModal({ assignment, onClose, onSubmitLog }: ChoreLogModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmitLog(assignment.id, note.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log chore duty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <PaperclipFastener position="top-left" />
        <PaperCard
          variant="sheet"
          className="rotate-1 p-6 shadow-paper-lifted border border-slate-300 dark:border-slate-700"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
            <div>
              <h3 className="font-hand font-bold text-2xl text-ink-navy dark:text-slate-100">
                Log Duty Instance
              </h3>
              <p className="text-xs font-hand text-ink-graphite dark:text-slate-400">
                {assignment.chore.title}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              aria-label="Close Log Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-hand">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-body">
                Note <span className="font-normal text-ink-muted dark:text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Optional note (e.g. Emptied kitchen trash and recycling bins)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#283548] border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-700 dark:focus:ring-amber-500 transition font-body"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-paper-card dark:bg-[#283548] hover:bg-slate-100 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-sm font-hand font-bold rounded-lg border border-slate-300 dark:border-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-hand font-bold rounded-lg shadow-paper-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? 'Logging...' : 'Submit Log'}</span>
              </button>
            </div>
          </form>
        </PaperCard>
      </div>
    </div>
  );
}
