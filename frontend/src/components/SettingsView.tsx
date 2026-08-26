import { useState } from 'react';
import {
  Home,
  User,
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  Clock,
  Check,
  Copy,
  AlertCircle,
  Bell,
  BellOff,
  BellRing,
} from 'lucide-react';
import { Household, Member } from '../types';

interface SettingsViewProps {
  household: Household;
  member: Member;
  onRegenerateCode: () => Promise<string>;
  onLogout: () => void;
  onToggleAway: (status: 'active' | 'away') => Promise<void>;
  pushEnabled?: boolean;
  pushSupported?: boolean;
  pushLoading?: boolean;
  onTogglePush?: () => Promise<any>;
}

export function SettingsView({
  household,
  member,
  onRegenerateCode,
  onLogout,
  onToggleAway,
  pushEnabled = false,
  pushSupported = true,
  pushLoading = false,
  onTogglePush,
}: SettingsViewProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState(household.invite_code);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingAway, setTogglingAway] = useState(false);

  const isAdmin = member.role === 'admin';
  const isAway = member.status === 'away';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Are you sure you want to regenerate the invite code? The old code will stop working.')) {
      return;
    }
    setRegenerating(true);
    setError(null);
    try {
      const newCode = await onRegenerateCode();
      if (newCode) {
        setCurrentCode(newCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate invite code');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleAway = async () => {
    setTogglingAway(true);
    try {
      await onToggleAway(isAway ? 'active' : 'away');
    } finally {
      setTogglingAway(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Household Settings</h2>
        <p className="text-xs text-slate-500">
          Manage your room, invite codes, and roommate preferences.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Household Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-4 h-4 text-indigo-600" />
          <span>Household Info</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">House Name</span>
            <span className="font-semibold text-slate-800 text-sm">{household.name}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">Timezone</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {household.timezone}
            </span>
          </div>
        </div>

        {/* Invite Code */}
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-indigo-950 block">
                Roommate Invite Code
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Share this 6-letter code with new roommates to let them join.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-900">
                {currentCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 transition"
                title="Copy Invite Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-indigo-100/70 flex justify-end">
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Code</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Member Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>My Profile</span>
        </h3>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block">Nickname</span>
            <span className="font-semibold text-slate-800 text-sm">{member.nickname}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
              {member.role}
            </span>
          </div>
        </div>

        {/* Away Mode Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              Away Mode
            </span>
            <p className="text-[11px] text-slate-500">
              Temporarily skip chore rotations and make your duties available to roommates.
            </p>
          </div>
          <button
            type="button"
            disabled={togglingAway}
            onClick={handleToggleAway}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isAway
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isAway ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isAway ? 'Currently Away' : 'Set Away'}</span>
          </button>
        </div>
      </div>

      {/* Push Notifications Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>Push Notifications</span>
        </h3>

        {!pushSupported ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs">
            <BellOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">Not supported in this browser</span>
              <p className="text-slate-500 mt-0.5">
                Web Push requires a modern browser or adding this app to your iOS Home Screen.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {pushEnabled ? (
                  <BellRing className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {pushEnabled ? 'Active - Receiving Alerts' : 'Push Notifications Disabled'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {pushEnabled
                      ? 'Instant alerts enabled for appliance cycle completions and chore duties.'
                      : 'Get alerted when laundry/dishes finish and new chore shifts start.'}
                  </p>
                </div>
              </div>

              {onTogglePush && (
                <button
                  type="button"
                  disabled={pushLoading}
                  onClick={onTogglePush}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 shrink-0 ${
                    pushEnabled
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {pushEnabled ? (
                    <>
                      <BellOff className="w-3.5 h-3.5" />
                      <span>Disable Push</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Enable Push</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout / Danger Zone */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
