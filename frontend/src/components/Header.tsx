import { useState } from 'react';
import { Home, Copy, Check, User, Moon } from 'lucide-react';
import { Household, Member } from '../types';

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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Household Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {household.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
                  title="Click to copy invite code"
                  aria-label={`Invite code ${household.invite_code}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>{household.invite_code}</span>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Member Badge & Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{member.nickname}</span>
              {member.role === 'admin' && (
                <span className="px-1 py-0.2 text-[10px] uppercase font-semibold tracking-wider bg-indigo-100 text-indigo-700 rounded">
                  Admin
                </span>
              )}
            </div>

            {member.status === 'away' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium animate-pulse">
                <Moon className="w-3 h-3 text-amber-600" />
                Away
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 mt-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onTabChange('appliances')}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'appliances'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Appliances
          </button>
          <button
            type="button"
            onClick={() => onTabChange('chores')}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'chores'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Chores
          </button>
          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
}
