import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
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
import { useAppliances } from './hooks/useAppliances';
import { useChores } from './hooks/useChores';
import { Chore, ChoreAssignment } from './types';
import { soundEngine } from './utils/soundEngine';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30000 } },
});

function MainApp() {
  const { member, household, token, logout, updateStatus, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('appliances');
  const [swapSource, setSwapSource] = useState<ChoreAssignment | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const qc = useQueryClient(), push = usePushNotifications();
  const appliances = useAppliances(), chores = useChores();

  useHouseholdWebSocket({ householdId: household?.id, token, queryClient: qc, onHouseholdChanged: refreshMe });
  useAppBadging(appliances.pendingAttentionCount + chores.myPendingChoresCount);

  if (!member || !household) return null;
  const swapTargets = swapSource ? chores.assignments.filter((a) => a.id !== swapSource.id && a.status === 'pending' && a.week_start_date === swapSource.week_start_date) : [];
  const handleTab = (t: NavTab) => { if (t !== activeTab) { soundEngine.playPageFlipSound(); setActiveTab(t); } };

  return (
    <div className="min-h-screen bg-canvas-bg text-ink-navy dark:text-slate-100 flex flex-col items-center py-4 sm:py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <Header household={household} member={member} activeTab={activeTab} onTabChange={handleTab} />
        <main id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="w-full flex flex-col gap-6">
          <PWAInstallPrompt />
          {activeTab === 'appliances' && <ApplianceDashboard domain={appliances} />}
          {activeTab === 'chores' && (
            <div className="space-y-8">
              <ChoreDutyView chores={chores} currentMember={member} household={household} onOpenSwap={setSwapSource} onEditChore={setEditingChore} onToggleAway={updateStatus} />
              <UpForGrabsPool chores={chores} onEditChore={setEditingChore} onDeleteChore={chores.deleteChore} />
            </div>
          )}
          {activeTab === 'settings' && (
            <SettingsView household={household} member={member} onRegenerateCode={async () => (await api.regenerateInviteCode()).invite_code} onLogout={logout} onToggleAway={updateStatus} pushEnabled={push.isSubscribed} pushSupported={push.isSupported} pushLoading={push.isLoading} onTogglePush={push.toggleSubscription} />
          )}
        </main>
      </div>
      {swapSource && <ChoreSwapModal sourceAssignment={swapSource} availableTargets={swapTargets} onClose={() => setSwapSource(null)} onSwap={async (s, t) => { await chores.swapChores(s, t); setSwapSource(null); }} />}
      {editingChore && <EditChoreModal chore={editingChore} onClose={() => setEditingChore(null)} onUpdateChore={async (id, data) => { await chores.updateChore(id, data); setEditingChore(null); }} onDeleteChore={async (id) => { await chores.deleteChore(id); setEditingChore(null); }} />}
    </div>
  );
}

function RootView() {
  const { isAuthenticated, isLoading, login, join, createHousehold } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-canvas-bg flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent-slate animate-spin" /></div>;
  return !isAuthenticated ? <Onboarding onLogin={login} onJoin={join} onCreate={createHousehold} /> : <MainApp />;
}

export function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><RootView /></AuthProvider></QueryClientProvider>;
}

export default App;
