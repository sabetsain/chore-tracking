import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, NavTab } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { ApplianceDashboard } from './components/ApplianceDashboard';
import { ChoreDutyView } from './components/ChoreDutyView';
import { UpForGrabsPool } from './components/UpForGrabsPool';
import { ChoreSwapModal } from './components/ChoreSwapModal';
import { EditChoreModal } from './components/EditChoreModal';
import { SettingsView } from './components/SettingsView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useHouseholdWebSocket } from './hooks/useHouseholdWebSocket';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useAppBadging } from './hooks/useAppBadging';
import { api } from './api/client';
import { ApplianceState, ApplianceType, Chore, ChoreAssignment, ChoreCompletionType } from './types';
import { soundEngine } from './utils/soundEngine';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

function MainApp() {
  const { member, household, token, logout, updateStatus, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('appliances');
  const [swapSourceAssignment, setSwapSourceAssignment] = useState<ChoreAssignment | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const qc = useQueryClient();

  // WebSocket Live Sync
  useHouseholdWebSocket({
    householdId: household?.id,
    token,
    queryClient: qc,
    onHouseholdChanged: refreshMe,
  });

  // Web Push Notifications
  const push = usePushNotifications();

  // Queries
  const { data: appliances = [] } = useQuery({
    queryKey: ['appliances'],
    queryFn: () => api.listAppliances(),
    enabled: !!household,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['chores', 'assignments'],
    queryFn: () => api.listAssignments(),
    enabled: !!household,
  });

  const { data: upForGrabs = [] } = useQuery({
    queryKey: ['chores', 'up-for-grabs'],
    queryFn: () => api.listUpForGrabs(),
    enabled: !!household,
  });

  // Dynamic OS App Badging
  const pendingAppliancesCount = appliances.filter((a) => a.current_state === 'clean_needs_emptying').length;
  const myPendingChoresCount = member
    ? assignments.filter((a) => a.member_id === member.id && a.status === 'pending').length
    : 0;
  useAppBadging(pendingAppliancesCount + myPendingChoresCount);

  // Mutations
  const updateAppStateMutation = useMutation({
    mutationFn: ({ id, toState }: { id: string; toState: ApplianceState }) =>
      api.updateApplianceState(id, toState),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const createApplianceMutation = useMutation({
    mutationFn: (data: { name: string; type: ApplianceType }) => api.createAppliance(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appliances'] });
    },
  });


  const completeChoreMutation = useMutation({
    mutationFn: (assignmentId: string) => api.completeChore(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const uncompleteChoreMutation = useMutation({
    mutationFn: (assignmentId: string) => api.uncompleteChore(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const reassignChoreMutation = useMutation({
    mutationFn: ({ assignmentId, memberId }: { assignmentId: string; memberId: string }) =>
      api.reassignChore(assignmentId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const createChoreMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      effort_weight: number;
      completion_type: ChoreCompletionType;
    }) => api.createChore(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const logDutyMutation = useMutation({
    mutationFn: ({ assignmentId, note }: { assignmentId: string; note?: string }) =>
      api.logChoreDuty(assignmentId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const claimChoreMutation = useMutation({
    mutationFn: (assignmentId: string) => api.claimChore(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const unclaimChoreMutation = useMutation({
    mutationFn: (id: string) => api.unclaimChore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const updateChoreMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        effort_weight?: number;
        completion_type?: ChoreCompletionType;
      };
    }) => api.updateChore(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: (id: string) => api.deleteChore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const swapChoreMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      api.swapChores(sourceId, targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const activateRotationMutation = useMutation({
    mutationFn: () => api.activateRotation(),
    onSuccess: async () => {
      await refreshMe();
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deactivateRotationMutation = useMutation({
    mutationFn: () => api.deactivateRotation(),
    onSuccess: async () => {
      await refreshMe();
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const reshuffleRotationMutation = useMutation({
    mutationFn: () => api.reshuffleRotation(),
    onSuccess: async () => {
      await refreshMe();
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const handleTabChange = (nextTab: NavTab) => {
    if (nextTab === activeTab) return;
    soundEngine.playPageFlipSound();
    setActiveTab(nextTab);
  };

  if (!member || !household) {
    return null;
  }

  // Target assignments available to swap with (other pending assignments in the week)
  const availableSwapTargets = swapSourceAssignment
    ? assignments.filter(
        (a) =>
          a.id !== swapSourceAssignment.id &&
          a.status === 'pending' &&
          a.week_start_date === swapSourceAssignment.week_start_date
      )
    : [];

  return (
    <div className="min-h-screen bg-paper-desk dark:bg-[#080D17] text-ink-navy dark:text-slate-100 flex flex-col items-center py-3 sm:py-6 px-2 sm:px-4 transition-colors duration-200">
      <div className="w-full max-w-5xl flex flex-col">
        {/* Tactile Spiral Binder Header */}
        <Header
          household={household}
          member={member}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Main Working Sheet Container */}
        <div className="w-full relative -mt-0.5 px-2 sm:px-4">
          <main
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            key={activeTab}
            className="bg-paper-sheet dark:bg-[#1A2234] page-stack min-h-[750px] sm:min-h-[850px] rounded-b-xl border-x-2 border-b-2 border-stone-300 dark:border-slate-700 shadow-binder-spine relative overflow-hidden p-4 sm:p-8"
          >
            <PWAInstallPrompt />

            {activeTab === 'appliances' && (
              <ApplianceDashboard
                appliances={appliances}
                onUpdateState={async (id, toState) => {
                  await updateAppStateMutation.mutateAsync({ id, toState });
                }}
                onFetchHistory={async (id) => api.getApplianceHistory(id)}
                onCreateAppliance={async (data) => {
                  await createApplianceMutation.mutateAsync(data);
                }}
              />
            )}

            {activeTab === 'chores' && (
              <div className="space-y-8">
                <ChoreDutyView
                  currentMember={member}
                  household={household}
                  assignments={assignments}
                  onCompleteChore={async (id) => {
                    await completeChoreMutation.mutateAsync(id);
                  }}
                  onUncompleteChore={async (id) => {
                    await uncompleteChoreMutation.mutateAsync(id);
                  }}
                  onUnclaimChore={async (id) => {
                    await unclaimChoreMutation.mutateAsync(id);
                  }}
                  onEditChore={(chore) => setEditingChore(chore)}
                  onDeleteChore={async (id) => {
                    await deleteChoreMutation.mutateAsync(id);
                  }}
                  onReassignChore={async (assignmentId, memberId) => {
                    await reassignChoreMutation.mutateAsync({ assignmentId, memberId });
                  }}
                  onLogDuty={async (id, note) => {
                    await logDutyMutation.mutateAsync({ assignmentId: id, note });
                  }}
                  onToggleAway={async (status) => {
                    await updateStatus(status);
                    qc.invalidateQueries({ queryKey: ['members'] });
                    qc.invalidateQueries({ queryKey: ['chores'] });
                  }}
                  onOpenSwap={(assignment) => setSwapSourceAssignment(assignment)}
                  onCreateChore={async (data) => {
                    await createChoreMutation.mutateAsync(data);
                  }}
                  onActivateRotation={async () => {
                    await activateRotationMutation.mutateAsync();
                  }}
                  onDeactivateRotation={async () => {
                    await deactivateRotationMutation.mutateAsync();
                  }}
                  onReshuffleRotation={async () => {
                    await reshuffleRotationMutation.mutateAsync();
                  }}
                />

                <UpForGrabsPool
                  chores={upForGrabs}
                  onClaimChore={async (id) => {
                    await claimChoreMutation.mutateAsync(id);
                  }}
                  onEditChore={(chore) => setEditingChore(chore)}
                  onDeleteChore={async (id) => {
                    await deleteChoreMutation.mutateAsync(id);
                  }}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsView
                household={household}
                member={member}
                onRegenerateCode={async () => {
                  const res = await api.regenerateInviteCode();
                  qc.invalidateQueries({ queryKey: ['members', 'me'] });
                  return res.invite_code;
                }}
                onLogout={logout}
                onToggleAway={async (status) => {
                  await updateStatus(status);
                  qc.invalidateQueries({ queryKey: ['members'] });
                  qc.invalidateQueries({ queryKey: ['chores'] });
                }}
                pushEnabled={push.isSubscribed}
                pushSupported={push.isSupported}
                pushLoading={push.isLoading}
                onTogglePush={push.toggleSubscription}
              />
            )}
          </main>
        </div>
      </div>

      {/* Chore Swap Modal */}
      {swapSourceAssignment && (
        <ChoreSwapModal
          sourceAssignment={swapSourceAssignment}
          availableTargets={availableSwapTargets}
          onClose={() => setSwapSourceAssignment(null)}
          onSwap={async (sourceId, targetId) => {
            await swapChoreMutation.mutateAsync({ sourceId, targetId });
          }}
        />
      )}

      {/* Edit Chore Modal */}
      {editingChore && (
        <EditChoreModal
          chore={editingChore}
          onClose={() => setEditingChore(null)}
          onUpdateChore={async (id, data) => {
            await updateChoreMutation.mutateAsync({ id, data });
          }}
          onDeleteChore={async (id) => {
            await deleteChoreMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}

function RootView() {
  const { isAuthenticated, isLoading, login, join, createHousehold } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-desk dark:bg-[#080D17] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Onboarding
        onLogin={login}
        onJoin={join}
        onCreate={createHousehold}
      />
    );
  }

  return <MainApp />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootView />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
