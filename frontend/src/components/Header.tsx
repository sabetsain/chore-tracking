import { useState } from 'react';
import {
  Home,
  Copy,
  Check,
  User,
  Moon,
  Sparkles,
  ListTodo,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Household, Member } from '../types';
import { NotebookTab } from './stationery/NotebookTab';
import { soundEffects } from '../utils/soundEffects';
import { soundEngine } from '../utils/soundEngine';

export type NavTab = 'appliances' | 'chores' | 'settings';

interface HeaderProps {
  household: Household;
  member: Member;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Header({ household, member, activeTab, onTabChange }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getMuted());

  const handleToggleMute = () => {
    const nextMuted = soundEffects.toggleMuted();
    soundEngine.setEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs: NavTab[] = ['appliances', 'chores', 'settings'];
    const currentIndex = tabs.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      onTabChange(nextTab);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      onTabChange(prevTab);
    }
  };

  return (
    <header className="w-full z-30">
      {/* Header Container */}
      <div className="bg-canvas-card dark:bg-canvas-card rounded-2xl border border-border-stone dark:border-[#252D37] px-5 py-4 sm:px-7 sm:py-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Household Branding & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent-slate text-white flex items-center justify-center shadow-sm shrink-0 border border-slate-700/20">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-sans font-bold text-ink-navy dark:text-slate-100 truncate tracking-tight">
                {household.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-ink-graphite dark:text-slate-400 mt-0.5 font-sans">
                <span className="text-xs opacity-75 font-medium">Invite Code:</span>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 dark:bg-[#222D42] hover:bg-stone-200/70 dark:hover:bg-[#2C3952] text-ink-navy dark:text-slate-200 font-mono text-xs font-semibold border border-stone-200/80 dark:border-slate-700 shadow-paper-sm transition-all active:scale-95"
                  title="Click to copy invite code"
                  aria-label={`Invite code ${household.invite_code}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent-sage" />
                      <span className="text-accent-sage font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span className="tabular-nums tracking-wide">{household.invite_code}</span>
                      <Copy className="w-3.5 h-3.5 text-ink-muted" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Controls: Audio Mute Toggle, Member Badge & Away Mode Pill */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {/* Audio Feedback Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-stone-100 dark:bg-[#222D42] border border-stone-200/80 dark:border-slate-700 text-ink-navy dark:text-slate-200 hover:bg-stone-200/70 dark:hover:bg-slate-700 shadow-paper-sm transition-all active:scale-95 flex items-center justify-center"
              title={isMuted ? 'Unmute audio feedback' : 'Mute audio feedback'}
              aria-label={isMuted ? 'Unmute audio feedback' : 'Mute audio feedback'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-accent-crimson dark:text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-ink-graphite dark:text-slate-300" />
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#222D42] border border-stone-200/80 dark:border-slate-700 text-xs font-semibold text-ink-navy dark:text-slate-200 shadow-paper-sm">
              <User className="w-3.5 h-3.5 text-ink-graphite dark:text-slate-400" />
              <span className="font-sans font-semibold text-sm leading-none">{member.nickname}</span>
              {member.role === 'admin' && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-stone-200/70 dark:bg-slate-800 text-accent-slate dark:text-slate-300 rounded border border-border-stone dark:border-slate-600">
                  Admin
                </span>
              )}
            </div>

            {member.status === 'away' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800/80 border border-border-stone dark:border-slate-700 text-accent-slate dark:text-slate-300 text-xs font-sans font-semibold shadow-sm">
                <Moon className="w-3.5 h-3.5 text-accent-slate dark:text-slate-400" />
                Away
              </span>
            )}
          </div>
        </div>

        {/* Clean Tactile Segmented Tab Bar */}
        <nav
          role="tablist"
          aria-label="Notebook Sections"
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1.5 p-1 bg-stone-100/80 dark:bg-[#181F2C] rounded-xl border border-border-stone/80 dark:border-[#252D37]"
        >
          <NotebookTab
            id="tab-appliances"
            controls="panel-appliances"
            label="Appliances"
            icon={Sparkles}
            isActive={activeTab === 'appliances'}
            onClick={() => onTabChange('appliances')}
            className="flex-1 sm:flex-initial"
          />
          <NotebookTab
            id="tab-chores"
            controls="panel-chores"
            label="Chores"
            icon={ListTodo}
            isActive={activeTab === 'chores'}
            onClick={() => onTabChange('chores')}
            className="flex-1 sm:flex-initial"
          />
          <NotebookTab
            id="tab-settings"
            controls="panel-settings"
            label="Settings"
            icon={SettingsIcon}
            isActive={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
            className="flex-1 sm:flex-initial"
          />
        </nav>
      </div>
    </header>
  );
}
