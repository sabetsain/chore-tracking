import {
  Appliance,
  ApplianceState,
  ApplianceStateLog,
  AuthResponse,
  Chore,
  ChoreAssignment,
  ChoreLog,
  Member,
  MemberMe,
} from '../types';

const API_BASE = '/api/v1';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    let data;
    try {
      data = await response.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // not json
    }
    throw new ApiError(response.status, errorDetail, data);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth & Household
  createHousehold: (data: { name: string; timezone?: string; nickname: string; pin?: string }) =>
    request<AuthResponse>('/households', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  joinHousehold: (data: { invite_code: string; nickname: string; pin?: string }) =>
    request<AuthResponse>('/households/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { nickname: string; pin?: string; invite_code?: string; household_id?: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<MemberMe>('/members/me'),

  updateMyStatus: (data: { status: 'active' | 'away'; away_until?: string | null }) =>
    request<Member>('/members/me/status', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  regenerateInviteCode: () => request<{ invite_code: string }>('/households/invite-code', { method: 'PATCH' }),

  deleteMember: (memberId: string) =>
    request<void>(`/members/${memberId}`, {
      method: 'DELETE',
    }),

  // Appliances
  listAppliances: () => request<Appliance[]>('/appliances'),

  createAppliance: (data: { name: string; type: string }) =>
    request<Appliance>('/appliances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplianceState: (applianceId: string, toState: ApplianceState, force = false) =>
    request<Appliance>(`/appliances/${applianceId}/state`, {
      method: 'POST',
      body: JSON.stringify({ to_state: toState, force }),
    }),

  getApplianceHistory: (applianceId: string) =>
    request<ApplianceStateLog[]>(`/appliances/${applianceId}/history`),

  // Chores
  listAssignments: (weekStartDate?: string) => {
    const query = weekStartDate ? `?week_start_date=${weekStartDate}` : '';
    return request<ChoreAssignment[]>(`/chores/assignments${query}`);
  },

  listUpForGrabs: (weekStartDate?: string) => {
    const query = weekStartDate ? `?week_start_date=${weekStartDate}` : '';
    return request<ChoreAssignment[]>(`/chores/up-for-grabs${query}`);
  },

  activateRotation: () =>
    request<ChoreAssignment[]>('/chores/rotation/activate', {
      method: 'POST',
    }),

  deactivateRotation: () =>
    request<ChoreAssignment[]>('/chores/rotation/deactivate', {
      method: 'POST',
    }),

  reshuffleRotation: () =>
    request<ChoreAssignment[]>('/chores/rotation/reshuffle', {
      method: 'POST',
    }),

  claimChore: (assignmentId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${assignmentId}/claim`, {
      method: 'POST',
    }),

  unclaimChore: (assignmentId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${assignmentId}/unclaim`, {
      method: 'POST',
    }),

  completeChore: (assignmentId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${assignmentId}/complete`, {
      method: 'POST',
    }),

  uncompleteChore: (assignmentId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${assignmentId}/uncomplete`, {
      method: 'POST',
    }),

  reassignChore: (assignmentId: string, memberId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${assignmentId}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ member_id: memberId }),
    }),

  logChoreDuty: (assignmentId: string, note?: string) =>
    request<ChoreLog>(`/chores/assignments/${assignmentId}/log`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  getChoreLogs: (assignmentId: string) =>
    request<ChoreLog[]>(`/chores/assignments/${assignmentId}/logs`),

  swapChores: (sourceAssignmentId: string, targetAssignmentId: string) =>
    request<ChoreAssignment>(`/chores/assignments/${sourceAssignmentId}/swap`, {
      method: 'POST',
      body: JSON.stringify({ target_assignment_id: targetAssignmentId }),
    }),

  listChores: (isActive?: boolean) => {
    const query = isActive !== undefined ? `?is_active=${isActive}` : '';
    return request<Chore[]>(`/chores${query}`);
  },

  createChore: (data: { title: string; description?: string; effort_weight: number; completion_type: string }) =>
    request<Chore>('/chores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateChore: (choreId: string, data: { title?: string; description?: string; effort_weight?: number; completion_type?: string }) =>
    request<Chore>(`/chores/${choreId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteChore: (choreId: string) =>
    request<void>(`/chores/${choreId}`, {
      method: 'DELETE',
    }),

  // Push Notifications
  getVapidPublicKey: () => request<{ public_key: string }>('/push/vapid-public-key'),

  subscribePush: (data: {
    endpoint: string;
    p256dh_key?: string;
    auth_key?: string;
    keys?: { p256dh: string; auth: string };
  }) =>
    request<any>('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unsubscribePush: (data?: { endpoint?: string }) =>
    request<void>('/push/unsubscribe', {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),
};
