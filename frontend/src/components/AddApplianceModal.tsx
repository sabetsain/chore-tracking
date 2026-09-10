import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Coffee,
  WashingMachine,
  Wind,
  CookingPot,
  Sparkles,
  Box,
  Waves,
  Zap,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Appliance,
  ApplianceCreate,
  ApplianceState,
  ApplianceUpdate,
} from '../types';
import { PaperCard } from './stationery/PaperCard';
import { PaperclipFastener } from './stationery/PaperclipFastener';
import { soundEngine } from '../utils/soundEngine';

export interface AddApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ApplianceCreate | ApplianceUpdate) => Promise<void>;
  appliance?: Appliance | null;
}

export const CANONICAL_STATES: { id: ApplianceState; label: string; description: string }[] = [
  { id: 'empty', label: 'Empty', description: 'Idle, ready to run or load' },
  { id: 'dirty', label: 'Dirty', description: 'Loaded with items awaiting run' },
  { id: 'running', label: 'Running', description: 'Active cycle operation' },
  { id: 'needs_attention', label: 'Needs Attention', description: 'Finished running, awaiting unload' },
  { id: 'clean', label: 'Clean', description: 'Sanitized and ready for use' },
];

export const ICON_OPTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'washing machine', label: 'Washer', icon: WashingMachine },
  { id: 'dryer', label: 'Dryer', icon: Wind },
  { id: 'pot', label: 'Pot', icon: CookingPot },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'box', label: 'Box', icon: Box },
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'waves', label: 'Waves', icon: Waves },
  { id: 'zap', label: 'Zap', icon: Zap },
];

const PRESET_TEMPLATES = [
  {
    name: 'Washer / Dryer Loop',
    icon: 'washing machine',
    steps: ['empty', 'running', 'needs_attention'] as ApplianceState[],
    timerEnabled: true,
    defaultMinutes: 45,
  },
  {
    name: 'Dishwasher Loop',
    icon: 'pot',
    steps: ['dirty', 'running', 'needs_attention'] as ApplianceState[],
    timerEnabled: true,
    defaultMinutes: 60,
  },
  {
    name: 'Sanitize / Clean Loop',
    icon: 'sparkles',
    steps: ['dirty', 'running', 'clean'] as ApplianceState[],
    timerEnabled: true,
    defaultMinutes: 30,
  },
  {
    name: 'Espresso Maker',
    icon: 'coffee',
    steps: ['empty', 'running', 'needs_attention'] as ApplianceState[],
    timerEnabled: false,
    defaultMinutes: 5,
  },
];

export function AddApplianceModal({
  isOpen,
  onClose,
  onSave,
  appliance,
}: AddApplianceModalProps) {
  const isEditing = Boolean(appliance);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('pot');
  const [steps, setSteps] = useState<ApplianceState[]>(['dirty', 'running', 'needs_attention']);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [defaultTimerMinutes, setDefaultTimerMinutes] = useState<number | ''>(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appliance) {
      setName(appliance.name);
      setIcon(appliance.icon || appliance.type || 'pot');
      
      const orderedSteps: ApplianceState[] = [
        appliance.state_step_1,
        appliance.state_step_2,
        appliance.state_step_3,
        appliance.state_step_4,
        appliance.state_step_5,
      ].filter(Boolean) as ApplianceState[];

      if (orderedSteps.length >= 2) {
        setSteps(orderedSteps);
      } else {
        setSteps(['empty', 'running', 'needs_attention']);
      }

      setTimerEnabled(Boolean(appliance.timer_enabled));
      setDefaultTimerMinutes(
        appliance.default_timer_minutes !== null && appliance.default_timer_minutes !== undefined
          ? appliance.default_timer_minutes
          : 45
      );
    } else {
      setName('');
      setIcon('pot');
      setSteps(['dirty', 'running', 'needs_attention']);
      setTimerEnabled(true);
      setDefaultTimerMinutes(60);
    }
    setError(null);
  }, [appliance, isOpen]);

  const handleStepChange = (index: number, newStep: ApplianceState) => {
    const updated = [...steps];
    updated[index] = newStep;
    setSteps(updated);
  };

  const handleAddStep = () => {
    if (steps.length >= 5) return;
    // Pick the first canonical state not already the immediately preceding step
    const lastStep = steps[steps.length - 1];
    const candidate = CANONICAL_STATES.find((s) => s.id !== lastStep)?.id || 'empty';
    setSteps([...steps, candidate]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) return;
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[number]) => {
    setIcon(preset.icon);
    setSteps([...preset.steps]);
    setTimerEnabled(preset.timerEnabled);
    setDefaultTimerMinutes(preset.defaultMinutes);
    soundEngine.playPencilScribbleSound();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter an appliance name.');
      return;
    }
    if (steps.length < 2 || steps.length > 5) {
      setError('Appliance lifecycle must configure between 2 and 5 steps.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: ApplianceCreate = {
      name: trimmedName,
      type: icon,
      icon,
      cycle_steps: steps,
      state_step_1: steps[0],
      state_step_2: steps[1],
      state_step_3: steps[2] || null,
      state_step_4: steps[3] || null,
      state_step_5: steps[4] || null,
      timer_enabled: timerEnabled,
      default_timer_minutes:
        timerEnabled && defaultTimerMinutes !== '' ? Number(defaultTimerMinutes) : null,
    };

    try {
      soundEngine.playStampSound();
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save appliance');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative max-w-lg w-full my-6"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 20 }}
          >
            <PaperclipFastener position="top-left" />
          </motion.div>

          <PaperCard
            variant="sheet"
            className="p-6 sm:p-7 shadow-paper-lifted border border-stone-300 dark:border-slate-700 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-700 mb-4">
              <div>
                <h3 className="font-serif font-bold text-2xl text-ink-navy dark:text-slate-100">
                  {isEditing ? 'Edit Appliance' : 'Add New Appliance'}
                </h3>
                <p className="text-xs text-ink-muted dark:text-slate-400 font-sans mt-0.5">
                  {isEditing
                    ? 'Configure machinery name, icon, and operational cycle.'
                    : 'Design a tailored cycle with customized state progression.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink-navy dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1">
              {/* Preset Shortcuts (for new appliances) */}
              {!isEditing && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted dark:text-slate-400 mb-1.5">
                    Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => handleApplyPreset(tpl)}
                        className="px-2.5 py-1 text-xs font-sans rounded-md bg-stone-100 dark:bg-slate-800 text-ink-graphite dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 transition"
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name input */}
              <div>
                <label
                  htmlFor="appliance-name"
                  className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans"
                >
                  Appliance Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="appliance-name"
                  type="text"
                  required
                  placeholder="Appliance name (e.g. Kitchen Dishwasher, Espresso Bar)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-700 dark:focus:ring-amber-500 transition font-sans"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1.5 font-sans">
                  Machine Icon
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                  {ICON_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = icon.toLowerCase() === opt.id.toLowerCase();
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setIcon(opt.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition text-center ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-500 dark:border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                            : 'bg-paper-card dark:bg-[#222D42] border-stone-200 dark:border-slate-700 text-ink-graphite dark:text-slate-300 hover:border-amber-300'
                        }`}
                        title={opt.label}
                        aria-label={opt.label}
                      >
                        <IconComp className="w-5 h-5 mb-0.5" />
                        <span className="text-[10px] font-sans truncate w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sequential Cycle Step Builder (2 to 5 steps) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 font-sans">
                    Cycle Progression ({steps.length} Steps)
                  </label>
                  {steps.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-ink-muted dark:text-slate-400 font-sans">
                  The cycle progresses linearly through these steps and loops back to Step 1.
                </p>

                <div className="space-y-2 bg-stone-50/70 dark:bg-slate-800/40 p-3 rounded-lg border border-stone-200 dark:border-slate-700">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-paper-sheet dark:bg-[#1A2234] p-2 rounded-md border border-stone-200 dark:border-slate-700 shadow-paper-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <select
                        value={step}
                        onChange={(e) => handleStepChange(idx, e.target.value as ApplianceState)}
                        aria-label={`Cycle Step ${idx + 1}`}
                        className="flex-1 px-2.5 py-1.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded text-xs font-sans font-medium text-ink-navy dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-700"
                      >
                        {CANONICAL_STATES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label} — {s.description}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStep(idx, 'up')}
                          className="p-1 rounded text-ink-muted hover:text-ink-navy disabled:opacity-30 transition"
                          title="Move up"
                          aria-label={`Move step ${idx + 1} up`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === steps.length - 1}
                          onClick={() => handleMoveStep(idx, 'down')}
                          className="p-1 rounded text-ink-muted hover:text-ink-navy disabled:opacity-30 transition"
                          title="Move down"
                          aria-label={`Move step ${idx + 1} down`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {steps.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="p-1 rounded text-red-500 hover:text-red-700 transition"
                            title="Remove step"
                            aria-label={`Remove step ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timer Configuration */}
              <div className="pt-2 border-t border-stone-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-ink-navy dark:text-slate-200 font-sans block">
                        Operational Countdown Timer
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-slate-400 font-sans">
                        Requires duration selection upon starting cycle.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="timer-enabled-toggle"
                    checked={timerEnabled}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500"
                    aria-label="Enable timer"
                  />
                </div>

                {timerEnabled && (
                  <div>
                    <label
                      htmlFor="default-duration-input"
                      className="block text-xs font-medium text-ink-navy dark:text-slate-200 mb-1 font-sans"
                    >
                      Default Duration (Minutes)
                    </label>
                    <input
                      id="default-duration-input"
                      type="number"
                      min={1}
                      max={720}
                      value={defaultTimerMinutes}
                      onChange={(e) =>
                        setDefaultTimerMinutes(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))
                      }
                      className="w-32 px-3 py-1.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded text-sm text-ink-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-700 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-stone-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-paper-card dark:bg-[#222D42] hover:bg-slate-100 dark:hover:bg-slate-700 text-ink-graphite dark:text-slate-300 text-sm font-sans font-semibold rounded-lg border border-stone-300 dark:border-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-sans font-bold rounded-lg shadow-paper-sm transition disabled:opacity-50"
                >
                  {submitting
                    ? isEditing
                      ? 'Saving...'
                      : 'Adding...'
                    : isEditing
                    ? 'Update Appliance'
                    : 'Save Appliance'}
                </button>
              </div>
            </form>
          </PaperCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AddApplianceModal;
