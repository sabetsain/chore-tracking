import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Appliance,
  ApplianceCreate,
  ApplianceState,
  ApplianceStateLog,
  ApplianceUpdate,
} from '../types';
import { soundEngine } from '../utils/soundEngine';

export interface ApplianceDomain {
  appliances: Appliance[];
  isLoading: boolean;
  error: unknown;
  updateState: (id: string, toState: ApplianceState, timerDurationMinutes?: number) => Promise<void>;
  createAppliance: (data: ApplianceCreate) => Promise<void>;
  updateAppliance: (id: string, data: ApplianceUpdate) => Promise<void>;
  resetAppliance: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<ApplianceStateLog[]>;
  pendingAttentionCount: number;
}

export function useAppliances(): ApplianceDomain {
  const queryClient = useQueryClient();

  const { data: appliances = [], isLoading, error } = useQuery({
    queryKey: ['appliances'],
    queryFn: () => api.listAppliances(),
  });

  const updateStateMutation = useMutation({
    mutationFn: ({
      id,
      toState,
      timerDurationMinutes,
    }: {
      id: string;
      toState: ApplianceState;
      timerDurationMinutes?: number;
    }) => api.updateApplianceState(id, toState, timerDurationMinutes),
    onSuccess: () => {
      soundEngine.playStampSound();
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const createApplianceMutation = useMutation({
    mutationFn: (data: ApplianceCreate) => api.createAppliance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const updateApplianceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplianceUpdate }) =>
      api.updateAppliance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const resetApplianceMutation = useMutation({
    mutationFn: (id: string) => api.resetAppliance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const pendingAttentionCount = appliances.filter(
    (a) => a.current_state === 'clean_needs_emptying' || a.current_state === 'needs_attention'
  ).length;

  return {
    appliances,
    isLoading,
    error,
    updateState: async (id: string, toState: ApplianceState, timerDurationMinutes?: number) => {
      await updateStateMutation.mutateAsync({ id, toState, timerDurationMinutes });
    },
    createAppliance: async (data: ApplianceCreate) => {
      await createApplianceMutation.mutateAsync(data);
    },
    updateAppliance: async (id: string, data: ApplianceUpdate) => {
      await updateApplianceMutation.mutateAsync({ id, data });
    },
    resetAppliance: async (id: string) => {
      await resetApplianceMutation.mutateAsync(id);
    },
    fetchHistory: (id: string) => api.getApplianceHistory(id),
    pendingAttentionCount,
  };
}

export default useAppliances;
