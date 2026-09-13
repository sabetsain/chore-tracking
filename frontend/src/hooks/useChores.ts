import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ChoreAssignment, ChoreCompletionType } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { soundEngine } from '../utils/soundEngine';
import { triggerPaperDustCelebration } from '../utils/confetti';

export interface ChoreDomain {
  assignments: ChoreAssignment[];
  upForGrabs: ChoreAssignment[];
  isLoading: boolean;
  error: unknown;
  completeChore: (assignmentId: string) => Promise<void>;
  uncompleteChore: (assignmentId: string) => Promise<void>;
  unclaimChore: (assignmentId: string) => Promise<void>;
  claimChore: (assignmentId: string) => Promise<void>;
  reassignChore: (assignmentId: string, memberId: string) => Promise<void>;
  swapChores: (sourceId: string, targetId: string) => Promise<void>;
  logDuty: (assignmentId: string, note?: string) => Promise<void>;
  createChore: (data: {
    title: string;
    description?: string;
    effort_weight: number;
    completion_type: ChoreCompletionType;
  }) => Promise<void>;
  updateChore: (
    id: string,
    data: {
      title?: string;
      description?: string;
      effort_weight?: number;
      completion_type?: ChoreCompletionType;
    }
  ) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;
  activateRotation: () => Promise<void>;
  deactivateRotation: () => Promise<void>;
  reshuffleRotation: () => Promise<void>;
  myPendingChoresCount: number;
}

export function useChores(weekStartDate?: string): ChoreDomain {
  const queryClient = useQueryClient();
  const { member, refreshMe } = useAuth();

  const assignmentsQueryKey = weekStartDate
    ? ['chores', 'assignments', weekStartDate]
    : ['chores', 'assignments'];

  const upForGrabsQueryKey = weekStartDate
    ? ['chores', 'up-for-grabs', weekStartDate]
    : ['chores', 'up-for-grabs'];

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({
    queryKey: assignmentsQueryKey,
    queryFn: () => api.listAssignments(weekStartDate),
  });

  const {
    data: upForGrabs = [],
    isLoading: upForGrabsLoading,
    error: upForGrabsError,
  } = useQuery({
    queryKey: upForGrabsQueryKey,
    queryFn: () => api.listUpForGrabs(weekStartDate),
  });

  const completeChoreMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      soundEffects.playWoodClick();
      return api.completeChore(assignmentId);
    },
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      if (member) {
        const remainingPending = assignments.filter(
          (a) => a.member_id === member.id && a.id !== assignmentId && a.status === 'pending'
        );
        if (remainingPending.length === 0) {
          triggerPaperDustCelebration();
        }
      }
    },
  });

  const uncompleteChoreMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      soundEffects.playWoodClick();
      soundEngine.playEraserSound();
      return api.uncompleteChore(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const unclaimChoreMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      soundEngine.playEraserSound();
      return api.unclaimChore(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const claimChoreMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      soundEffects.playWoodClick();
      soundEngine.playTapePeelSound();
      return api.claimChore(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const reassignChoreMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      memberId,
    }: {
      assignmentId: string;
      memberId: string;
    }) => {
      soundEngine.playEraserSound();
      return api.reassignChore(assignmentId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const swapChoresMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      api.swapChores(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const logDutyMutation = useMutation({
    mutationFn: ({ assignmentId, note }: { assignmentId: string; note?: string }) =>
      api.logChoreDuty(assignmentId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
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
      queryClient.invalidateQueries({ queryKey: ['chores'] });
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
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: async (id: string) => {
      soundEngine.playEraserSound();
      return api.deleteChore(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });

  const activateRotationMutation = useMutation({
    mutationFn: async () => {
      soundEngine.playPencilScribbleSound();
      return api.activateRotation();
    },
    onSuccess: async () => {
      if (refreshMe) await refreshMe();
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deactivateRotationMutation = useMutation({
    mutationFn: async () => {
      soundEngine.playEraserSound();
      return api.deactivateRotation();
    },
    onSuccess: async () => {
      if (refreshMe) await refreshMe();
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const reshuffleRotationMutation = useMutation({
    mutationFn: async () => {
      soundEngine.playPencilScribbleSound();
      return api.reshuffleRotation();
    },
    onSuccess: async () => {
      if (refreshMe) await refreshMe();
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const myPendingChoresCount = member
    ? assignments.filter((a) => a.member_id === member.id && a.status === 'pending').length
    : 0;

  return {
    assignments,
    upForGrabs,
    isLoading: assignmentsLoading || upForGrabsLoading,
    error: assignmentsError || upForGrabsError,
    completeChore: async (assignmentId: string) => {
      await completeChoreMutation.mutateAsync(assignmentId);
    },
    uncompleteChore: async (assignmentId: string) => {
      await uncompleteChoreMutation.mutateAsync(assignmentId);
    },
    unclaimChore: async (assignmentId: string) => {
      await unclaimChoreMutation.mutateAsync(assignmentId);
    },
    claimChore: async (assignmentId: string) => {
      await claimChoreMutation.mutateAsync(assignmentId);
    },
    reassignChore: async (assignmentId: string, memberId: string) => {
      await reassignChoreMutation.mutateAsync({ assignmentId, memberId });
    },
    swapChores: async (sourceId: string, targetId: string) => {
      await swapChoresMutation.mutateAsync({ sourceId, targetId });
    },
    logDuty: async (assignmentId: string, note?: string) => {
      await logDutyMutation.mutateAsync({ assignmentId, note });
    },
    createChore: async (data) => {
      await createChoreMutation.mutateAsync(data);
    },
    updateChore: async (id, data) => {
      await updateChoreMutation.mutateAsync({ id, data });
    },
    deleteChore: async (id: string) => {
      await deleteChoreMutation.mutateAsync(id);
    },
    activateRotation: async () => {
      await activateRotationMutation.mutateAsync();
    },
    deactivateRotation: async () => {
      await deactivateRotationMutation.mutateAsync();
    },
    reshuffleRotation: async () => {
      await reshuffleRotationMutation.mutateAsync();
    },
    myPendingChoresCount,
  };
}

export default useChores;
