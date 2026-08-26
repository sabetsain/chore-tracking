import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, NavTab } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { ApplianceDashboard } from './components/ApplianceDashboard';
import { ChoreDutyView } from './components/ChoreDutyView';
import { UpForGrabsPool } from './components/UpForGrabsPool';
import { ChoreSwapModal } from './components/ChoreSwapModal';
import { SettingsView } from './components/SettingsView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useHouseholdWebSocket } from './hooks/useHouseholdWebSocket';
import { usePushNotifications } from './hooks/usePushNotifications';
import { api } from './api/client';
import { ApplianceState, ApplianceType, ChoreAssignment } from './types';
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
  const { member, household, token, logout, updateStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('appliances');
  const [swapSourceAssignment, setSwapSourceAssignment] = useState<ChoreAssignment | null>(null);

  const qc = useQueryClient();

  // WebSocket Live Sync
  useHouseholdWebSocket({
    householdId: household?.id,
    token,
    queryClient: qc,
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

  const swapChoreMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      api.swapChores(sourceId, targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
    },
  });

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        household={household}
        member={member}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
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
              assignments={assignments}
              onCompleteChore={async (id) => {
                await completeChoreMutation.mutateAsync(id);
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
            />

            <UpForGrabsPool
              chores={upForGrabs}
              onClaimChore={async (id) => {
                await claimChoreMutation.mutateAsync(id);
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
    </div>
  );
}

function RootView() {
  const { isAuthenticated, isLoading, login, join, createHousehold } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
