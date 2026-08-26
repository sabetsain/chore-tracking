import { useState } from 'react';
import { Home, Copy, Check, User, Moon, Sparkles, ListTodo, Settings as SettingsIcon } from 'lucide-react';
import { Household, Member } from '../types';
import { NotebookTab } from './stationery/NotebookTab';
import { SpiralSpine } from './stationery/SpiralSpine';

export type NavTab = 'appliances' | 'chores' | 'settings';

interface HeaderProps {
  household: Household;
  member: Member;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Header({ household, member, activeTab, onTabChange }: HeaderProps) {
  const [copied, setCopied] = useState(false);

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
    <header className="relative w-full z-30 pt-2 pb-0 px-2 sm:px-4">
      {/* Top Wire Spiral Coil Binder Spine */}
      <div className="w-full flex justify-center -mb-2 overflow-hidden px-2">
        <SpiralSpine orientation="horizontal" count={18} className="w-full max-w-4xl" />
      </div>

      {/* Binder Header Plank */}
      <div className="bg-paper-bg dark:bg-[#1e293b]/95 backdrop-blur rounded-t-xl border-t-2 border-x-2 border-slate-300 dark:border-slate-700 px-4 sm:px-6 pt-4 pb-2 shadow-paper-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          {/* Household Branding & Logbook Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-amber-50 shadow-sm shrink-0 border border-amber-900/40">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-hand font-bold text-ink-navy dark:text-slate-100 truncate tracking-tight">
                {household.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-ink-graphite dark:text-slate-400 mt-0.5">
                <span className="font-hand text-sm opacity-80">Invite Code:</span>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-paper-card dark:bg-[#283548] hover:bg-amber-100/60 dark:hover:bg-[#334155] text-ink-navy dark:text-slate-200 font-mono text-xs font-semibold border border-slate-300 dark:border-slate-600 shadow-paper-sm transition-all active:scale-95"
                  title="Click to copy invite code"
                  aria-label={`Invite code ${household.invite_code}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-stamp-clean" />
                      <span className="text-stamp-clean font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>{household.invite_code}</span>
                      <Copy className="w-3.5 h-3.5 text-ink-muted" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Member Badge & Away Mode Pill */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-card dark:bg-[#283548] border border-slate-300 dark:border-slate-600 text-xs font-semibold text-ink-navy dark:text-slate-200 shadow-paper-sm">
              <User className="w-3.5 h-3.5 text-ink-graphite dark:text-slate-400" />
              <span className="font-hand text-base leading-none">{member.nickname}</span>
              {member.role === 'admin' && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded border border-amber-300 dark:border-amber-700">
                  Admin
                </span>
              )}
            </div>

            {member.status === 'away' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-hand font-bold animate-pulse shadow-sm">
                <Moon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Away
              </span>
            )}
          </div>
        </div>

        {/* Die-Cut Protruding Index Tabs */}
        <nav
          role="tablist"
          aria-label="Notebook Sections"
          onKeyDown={handleKeyDown}
          className="flex items-end gap-1.5 sm:gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 -mb-[2px]"
        >
          <NotebookTab
            id="tab-appliances"
            controls="panel-appliances"
            label="Appliances"
            icon={Sparkles}
            isActive={activeTab === 'appliances'}
            onClick={() => onTabChange('appliances')}
            colorClass="bg-[#ede4d1] dark:bg-[#2c384a]"
            className="flex-1 sm:flex-none text-center"
          />
          <NotebookTab
            id="tab-chores"
            controls="panel-chores"
            label="Chores"
            icon={ListTodo}
            isActive={activeTab === 'chores'}
            onClick={() => onTabChange('chores')}
            colorClass="bg-[#e4ddc8] dark:bg-[#323d4f]"
            className="flex-1 sm:flex-none text-center"
          />
          <NotebookTab
            id="tab-settings"
            controls="panel-settings"
            label="Settings"
            icon={SettingsIcon}
            isActive={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
            colorClass="bg-[#ded6bf] dark:bg-[#374457]"
            className="flex-1 sm:flex-none text-center"
          />
        </nav>
      </div>
    </header>
  );
}
