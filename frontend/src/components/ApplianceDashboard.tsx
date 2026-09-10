import { useState } from 'react';
import {
  Plus,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Appliance, ApplianceState, ApplianceStateLog, ApplianceType } from '../types';
import { ApplianceCard } from './ApplianceCard';
import { formatDateTime } from '../utils/time';
import { PaperCard } from './stationery/PaperCard';

interface ApplianceDashboardProps {
  appliances: Appliance[];
  onUpdateState: (applianceId: string, toState: ApplianceState) => Promise<void>;
  onFetchHistory: (applianceId: string) => Promise<ApplianceStateLog[]>;
  onCreateAppliance: (data: { name: string; type: ApplianceType }) => Promise<void>;
}

export function ApplianceDashboard({
  appliances,
  onUpdateState,
  onFetchHistory,
  onCreateAppliance,
}: ApplianceDashboardProps) {
  // History modal state
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ApplianceStateLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Add appliance modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppType, setNewAppType] = useState<ApplianceType>('dishwasher');
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleOpenHistory = async (app: Appliance) => {
    setSelectedAppliance(app);
    setLoadingHistory(true);
    try {
      const logs = await onFetchHistory(app.id);
      setHistoryLogs(logs);
    } catch {
      setHistoryLogs([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateAppliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setSubmittingAdd(true);
    setAddError(null);
    try {
      await onCreateAppliance({
        name: newAppName.trim(),
        type: newAppType,
      });
      setNewAppName('');
      setNewAppType('dishwasher');
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add appliance');
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-slate-700/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-navy dark:text-slate-100 tracking-tight">
            Appliance Status
          </h2>
          <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans mt-0.5">
            Real-time status tracking for shared household machinery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center self-start sm:self-center gap-1.5 px-4 py-2 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appliance</span>
        </button>
      </div>

      {/* Grid of Appliances */}
      {appliances.length === 0 ? (
        <PaperCard variant="card" className="p-8 text-center border-dashed border-2 border-stone-300 dark:border-slate-700">
          <Sparkles className="w-8 h-8 text-accent-slate mx-auto mb-2 opacity-80" />
          <p className="text-base font-serif font-bold text-ink-navy dark:text-slate-200">No appliances added yet</p>
          <p className="text-xs text-ink-muted dark:text-slate-400 mt-1 font-sans">
            Add a dishwasher, washing machine, or dryer to start tracking!
          </p>
        </PaperCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {appliances.map((app) => (
            <ApplianceCard
              key={app.id}
              appliance={app}
              onUpdateState={onUpdateState}
              onViewHistory={handleOpenHistory}
            />
          ))}
        </div>
      )}

      {/* History Modal (Paperclipped Ledger Slip) */}
      <AnimatePresence>
        {selectedAppliance && (
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
                layoutId={`appliance-${selectedAppliance.id}`}
                className="-rotate-1 p-6 shadow-paper-lifted max-h-[85vh] flex flex-col border border-border-stone dark:border-slate-600"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-stone dark:border-slate-600">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-ink-navy dark:text-slate-100">
                      Activity History
                    </h3>
                    <p className="font-mono text-xs text-ink-graphite dark:text-slate-400 mt-0.5">
                      {selectedAppliance.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAppliance(null)}
                    className="p-1 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                    aria-label="Close History"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                  {loadingHistory ? (
                    <p className="text-center font-sans text-xs text-ink-muted dark:text-slate-400 py-8">Loading ledger history...</p>
                  ) : historyLogs.length === 0 ? (
                    <p className="text-center font-sans text-xs text-ink-muted dark:text-slate-400 py-8">No recent state changes logged.</p>
                  ) : (
                    historyLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-border-stone dark:border-slate-700 flex items-center justify-between text-xs shadow-paper-sm"
                      >
                        <div>
                          <div className="font-sans font-semibold text-sm text-ink-navy dark:text-slate-100 capitalize">
                            {log.from_state.replace('_', ' ')} → {log.to_state.replace('_', ' ')}
                          </div>
                          <div className="text-ink-muted dark:text-slate-400 font-mono text-[11px] mt-0.5">
                            {formatDateTime(log.created_at)}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-sans font-semibold text-xs text-ink-navy dark:text-slate-200">
                            {log.actor_member
                              ? log.actor_member.nickname
                              : log.trigger_source === 'sensor_webhook'
                              ? 'IoT Sensor'
                              : 'System'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-border-stone dark:border-slate-600">
                  <button
                    type="button"
                    onClick={() => setSelectedAppliance(null)}
                    className="w-full py-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-stone-100 dark:hover:bg-[#2C3952] text-ink-navy dark:text-slate-200 font-sans text-sm font-bold rounded-lg border border-stone-300 dark:border-slate-600 shadow-paper-sm transition active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              </PaperCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Appliance Modal (Paperclipped Memo Card) */}
      <AnimatePresence>
        {showAddModal && (
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
                  <h3 className="font-serif font-bold text-2xl text-ink-navy dark:text-slate-100">
                    Add New Appliance
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    aria-label="Close Add Appliance"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {addError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAppliance} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                      Appliance Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Appliance name (e.g. Kitchen Dishwasher)"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                      Appliance Type
                    </label>
                    <select
                      value={newAppType}
                      onChange={(e) => setNewAppType(e.target.value as ApplianceType)}
                      className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
                    >
                      <option value="dishwasher">Dishwasher</option>
                      <option value="washer">Washing Machine</option>
                      <option value="dryer">Clothes Dryer</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-slate-100 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAdd}
                      className="flex-1 py-2.5 bg-accent-slate hover:bg-[#1E334A] text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm transition disabled:opacity-50"
                    >
                      {submittingAdd ? 'Adding...' : 'Save Appliance'}
                    </button>
                  </div>
                </form>
              </PaperCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
