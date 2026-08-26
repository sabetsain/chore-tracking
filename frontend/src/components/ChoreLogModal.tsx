import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { ChoreAssignment } from '../types';

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Log Duty Instance</h3>
            <p className="text-xs text-slate-500">{assignment.chore.title}</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Optional note (e.g. Emptied kitchen trash and recycling bins)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Logging...' : 'Submit Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
