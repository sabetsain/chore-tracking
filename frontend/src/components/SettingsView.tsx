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
  Volume2,
  VolumeX,
  Share2,
  Monitor,
} from 'lucide-react';
import { Household, Member } from '../types';
import { PaperCard } from './stationery/PaperCard';
import { soundEngine } from '../utils/soundEngine';
import { useWakeLock } from '../hooks/useWakeLock';

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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundEngine.getEnabled());
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const wakeLock = useWakeLock();
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

  const handleShare = async () => {
    const shareData = {
      title: `Join ${household.name} on Household Logbook`,
      text: `Join our household on Household Logbook using invite code: ${currentCode}`,
      url: typeof window !== 'undefined' ? window.location.origin : '',
    };
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback or user cancelled
      }
    } else {
      handleCopy();
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

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEngine.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundEngine.playStampSound();
    }
  };

  const toggleDeskLamp = () => {
    if (typeof document !== 'undefined') {
      const next = document.documentElement.classList.toggle('dark');
      setIsDark(next);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-2 border-b border-stone-200/80 dark:border-slate-700/80">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-navy dark:text-slate-100">Household Settings</h2>
        <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans mt-0.5">
          Manage your room, invite codes, desk lighting, sound effects, and roommate preferences.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Household Info Ledger Card */}
      <PaperCard variant="card" className="p-5 shadow-paper-sm space-y-4 border border-stone-200/80 dark:border-slate-700/80">
        <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
          <Home className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          <span>Household Info</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm">
            <span className="text-ink-muted dark:text-slate-400 block mb-1 font-mono text-[11px]">House Name</span>
            <span className="font-serif font-bold text-ink-navy dark:text-slate-100 text-lg">{household.name}</span>
          </div>

          <div className="p-3 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm">
            <span className="text-ink-muted dark:text-slate-400 block mb-1 font-mono text-[11px]">Timezone</span>
            <span className="font-serif font-bold text-ink-navy dark:text-slate-100 text-lg flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              {household.timezone}
            </span>
          </div>
        </div>

        {/* Invite Code */}
        <div className="p-4 bg-paper-manila dark:bg-[#2C3952] border border-amber-300/80 dark:border-slate-600 rounded-lg shadow-paper-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-sans font-bold text-ink-navy dark:text-slate-100 block">
                Roommate Invite Code
              </span>
              <p className="text-xs text-ink-graphite dark:text-slate-300 mt-0.5 font-sans">
                Share this 6-letter code with new roommates to let them join.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-base font-bold tracking-wider px-3 py-1 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-ink-navy dark:text-slate-100 shadow-paper-sm">
                {currentCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 transition shadow-paper-sm active:scale-95"
                title="Copy Invite Code"
                aria-label="Copy Invite Code"
              >
                {copied ? <Check className="w-4 h-4 text-stamp-clean" /> : <Copy className="w-4 h-4 text-ink-graphite" />}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-lg bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 transition shadow-paper-sm active:scale-95 flex items-center gap-1.5 font-sans text-xs font-bold"
                title="Share Invite Code"
                aria-label="Share Invite Code"
              >
                <Share2 className="w-4 h-4 text-ink-graphite dark:text-slate-300" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-amber-300/60 dark:border-slate-600 flex justify-end">
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 hover:underline font-sans font-bold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Code</span>
              </button>
            </div>
          )}
        </div>
      </PaperCard>

      {/* Member Profile Card */}
      <PaperCard variant="card" className="p-5 shadow-paper-sm space-y-4 border border-stone-200/80 dark:border-slate-700/80">
        <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          <span>My Profile</span>
        </h3>

        <div className="flex items-center justify-between p-3 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 text-xs shadow-paper-sm">
          <div>
            <span className="text-ink-muted dark:text-slate-400 block font-mono text-[11px]">Nickname</span>
            <span className="font-serif font-bold text-ink-navy dark:text-slate-100 text-lg">{member.nickname}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-paper-manila dark:bg-slate-700 border border-amber-300 dark:border-slate-600 text-ink-navy dark:text-slate-200 font-mono font-bold uppercase text-[10px]">
              {member.role}
            </span>
          </div>
        </div>

        {/* Away Mode Switch */}
        <div className="flex items-center justify-between p-3 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm">
          <div>
            <span className="text-sm font-sans font-bold text-ink-navy dark:text-slate-100 block">
              Away Mode
            </span>
            <p className="text-xs text-ink-graphite dark:text-slate-400 font-sans mt-0.5">
              Temporarily skip chore rotations and make your duties available to roommates.
            </p>
          </div>
          <button
            type="button"
            disabled={togglingAway}
            onClick={handleToggleAway}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-sans font-bold transition shadow-paper-sm active:scale-95 shrink-0 ${
              isAway
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-paper-card dark:bg-[#222D42] text-ink-navy dark:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-600'
            }`}
          >
            {isAway ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            <span>{isAway ? 'Currently Away' : 'Set Away'}</span>
          </button>
        </div>
      </PaperCard>

      {/* Desk Stationery & Environment Controls */}
      <PaperCard variant="card" className="p-5 shadow-paper-sm space-y-4 border border-stone-200/80 dark:border-slate-700/80">
        <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Desk & Atmosphere Controls</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Desk Lamp Night Mode Toggle */}
          <div className="p-4 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm flex items-center justify-between">
            <div>
              <span className="text-sm font-sans font-bold text-ink-navy dark:text-slate-100 block">
                Desk Lamp (Theme)
              </span>
              <p className="text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                {isDark ? 'Night journal dark paper' : 'Daytime unbleached bond paper'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDeskLamp}
              className={`p-2.5 rounded-lg border shadow-paper-sm transition active:scale-95 ${
                isDark
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-amber-100/80 border-amber-300 text-amber-800 hover:bg-amber-200'
              }`}
              title="Toggle Desk Lamp"
              aria-label="Toggle Desk Lamp"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Procedural Audio Toggle */}
          <div className="p-4 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm flex items-center justify-between">
            <div>
              <span className="text-sm font-sans font-bold text-ink-navy dark:text-slate-100 block">
                Stationery Audio
              </span>
              <p className="text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                {soundEnabled ? 'Paper rustle & stamp clicks active' : 'Audio effects muted'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2.5 rounded-lg border shadow-paper-sm transition active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-stamp-clean dark:text-emerald-300'
                  : 'bg-paper-card dark:bg-[#222D42] border-stone-300 dark:border-slate-600 text-ink-muted'
              }`}
              title="Toggle Sound Effects"
              aria-label="Toggle Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Countertop Fridge Kiosk Mode Toggle */}
          <div className="p-4 bg-paper-sheet dark:bg-[#1A2234] rounded-lg border border-stone-200/80 dark:border-slate-700 shadow-paper-sm flex items-center justify-between sm:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-sans font-bold text-ink-navy dark:text-slate-100 block">
                  Countertop Fridge Kiosk Mode
                </span>
                {wakeLock.isActive && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-stamp-clean dark:text-emerald-300 text-[10px] font-sans font-bold border border-emerald-300 dark:border-emerald-700">
                    Always On
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                {wakeLock.isSupported
                  ? (wakeLock.isActive
                      ? 'Screen will stay awake for wall-mounted tablet or fridge display.'
                      : 'Keep screen awake without dimming when mounted on a fridge or counter.')
                  : 'Screen wake lock is not available on this device.'}
              </p>
            </div>
            {wakeLock.isSupported ? (
              <button
                type="button"
                onClick={wakeLock.toggleWakeLock}
                className={`p-2.5 rounded-lg border shadow-paper-sm transition active:scale-95 ${
                  wakeLock.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-stamp-clean dark:text-emerald-300'
                    : 'bg-paper-card dark:bg-[#222D42] border-stone-300 dark:border-slate-600 text-ink-muted'
                }`}
                title="Toggle Countertop Kiosk Mode"
                aria-label="Toggle Countertop Kiosk Mode"
              >
                <Monitor className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        </div>
      </PaperCard>

      {/* Push Notifications Card */}
      <PaperCard variant="card" className="p-5 shadow-paper-sm space-y-4 border border-stone-200/80 dark:border-slate-700/80">
        <h3 className="text-xl font-serif font-bold text-ink-navy dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          <span>Push Notifications</span>
        </h3>

        {!pushSupported ? (
          <div className="p-4 bg-paper-sheet dark:bg-[#1A2234] border border-stone-200/80 dark:border-slate-700 rounded-lg flex items-start gap-3 text-xs shadow-paper-sm">
            <BellOff className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
            <div>
              <span className="font-serif font-bold text-base text-ink-navy dark:text-slate-200 block">Not supported in this browser</span>
              <p className="text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                Web Push requires a modern browser or adding this app to your iOS Home Screen.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-paper-sheet dark:bg-[#1A2234] border border-stone-200/80 dark:border-slate-700 rounded-lg space-y-3 shadow-paper-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {pushEnabled ? (
                  <BellRing className="w-5 h-5 text-stamp-clean shrink-0 mt-0.5" />
                ) : (
                  <BellOff className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-base font-serif font-bold text-ink-navy dark:text-slate-100 block">
                    {pushEnabled ? 'Active - Receiving Alerts' : 'Push Notifications Disabled'}
                  </span>
                  <p className="text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
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
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-sans font-bold shadow-paper-sm transition disabled:opacity-50 shrink-0 active:scale-95 ${
                    pushEnabled
                      ? 'bg-paper-card dark:bg-[#222D42] hover:bg-slate-100 dark:hover:bg-slate-700 text-ink-navy dark:text-slate-200 border border-stone-300 dark:border-slate-600'
                      : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                  }`}
                >
                  {pushEnabled ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      <span>Disable Push</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Enable Push</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </PaperCard>

      {/* Logout / Danger Zone */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-sm font-sans font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-paper-sm active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
