import { useState } from 'react';
import {
  Plus,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Appliance, ApplianceState, ApplianceStateLog, ApplianceType } from '../types';
import { ApplianceCard } from './ApplianceCard';
import { formatDateTime } from '../utils/time';

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
  const [newAppType, setNewAppType] = useState<ApplianceType>('custom');
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
      setNewAppType('custom');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Appliance Status</h2>
          <p className="text-xs text-slate-500">
            Real-time status tracking for shared appliances.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appliance</span>
        </button>
      </div>

      {/* Grid of Appliances */}
      {appliances.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No appliances added yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Add a dishwasher, washing machine, or dryer to start tracking!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* History Modal */}
      {selectedAppliance && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Activity History
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAppliance.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppliance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingHistory ? (
                <p className="text-center text-xs text-slate-400 py-8">Loading history...</p>
              ) : historyLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">No recent state changes.</p>
              ) : (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 capitalize">
                        {log.from_state.replace('_', ' ')} → {log.to_state.replace('_', ' ')}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-medium text-slate-700">
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

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAppliance(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Appliance</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppliance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appliance Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Appliance name (e.g. Kitchen Dishwasher)"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appliance Type
                </label>
                <select
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value as ApplianceType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                >
                  <option value="dishwasher">Dishwasher</option>
                  <option value="washer">Washing Machine</option>
                  <option value="dryer">Clothes Dryer</option>
                  <option value="custom">Custom Appliance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submittingAdd ? 'Adding...' : 'Save Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
