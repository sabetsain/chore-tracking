export interface Household {
  id: string;
  name: string;
  invite_code: string;
  timezone: string;
  chore_rotation_active: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  household_id: string;
  nickname: string;
  role: 'admin' | 'member';
  status: 'active' | 'away';
  away_until?: string | null;
  created_at: string;
}

export interface MemberMe extends Member {
  household: Household;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  member: Member;
  household: Household;
}

export type ApplianceType = 'dishwasher' | 'washer' | 'dryer' | 'custom' | string;
export type ApplianceState = 'empty' | 'dirty' | 'running' | 'needs_attention' | 'clean' | 'clean_needs_emptying';

export interface Appliance {
  id: string;
  household_id: string;
  name: string;
  type: ApplianceType;
  icon?: string;
  current_state: ApplianceState;
  state_updated_at: string;
  updated_by_member_id?: string | null;
  updated_by_member?: Member | null;
  state_step_1: string;
  state_step_2: string;
  state_step_3?: string | null;
  state_step_4?: string | null;
  state_step_5?: string | null;
  timer_enabled: boolean;
  default_timer_minutes?: number | null;
  timer_duration_minutes?: number | null;
  timer_started_at?: string | null;
  timer_ends_at?: string | null;
  next_state?: string | null;
}

export interface ApplianceCreate {
  name: string;
  type?: string;
  icon?: string;
  cycle_steps?: string[];
  state_step_1?: string;
  state_step_2?: string;
  state_step_3?: string | null;
  state_step_4?: string | null;
  state_step_5?: string | null;
  timer_enabled?: boolean;
  default_timer_minutes?: number | null;
}

export interface ApplianceUpdate {
  name?: string;
  type?: string;
  icon?: string;
  cycle_steps?: string[];
  state_step_1?: string;
  state_step_2?: string;
  state_step_3?: string | null;
  state_step_4?: string | null;
  state_step_5?: string | null;
  timer_enabled?: boolean;
  default_timer_minutes?: number | null;
}

export interface ApplianceStateUpdate {
  to_state: ApplianceState;
  force?: boolean;
  timer_duration_minutes?: number | null;
}

export interface ApplianceStateLog {
  id: string;
  appliance_id: string;
  from_state: string;
  to_state: string;
  trigger_source: string;
  actor_member_id?: string | null;
  created_at: string;
  actor_member?: Member | null;
}

export type ChoreCompletionType = 'single_weekly' | 'continuous_duty';

export interface Chore {
  id: string;
  household_id: string;
  title: string;
  description?: string | null;
  effort_weight: number;
  completion_type: ChoreCompletionType;
  is_active: boolean;
  created_at: string;
}

export interface ChoreAssignment {
  id: string;
  chore_id: string;
  member_id?: string | null;
  week_start_date: string;
  status: 'pending' | 'completed' | 'skipped' | 'swapped';
  completed_at?: string | null;
  completed_by_member_id?: string | null;
  duty_instances_count?: number;
  chore: Chore;
  member?: Member | null;
  completed_by_member?: Member | null;
}

export interface ChoreLog {
  id: string;
  assignment_id: string;
  actor_member_id: string;
  note?: string | null;
  logged_at: string;
  actor_member?: Member | null;
}

export type WebSocketEvent =
  | { event: 'APPLIANCE_STATE_CHANGED'; data: Appliance }
  | { event: 'CHORE_UPDATED'; data: { action: string; assignment?: ChoreAssignment; log?: ChoreLog; chore?: Chore; chore_id?: string } }
  | { event: 'CHORE_ROTATION_CHANGED'; data: { household_id: string; chore_rotation_active: boolean } }
  | { event: 'MEMBER_STATUS_CHANGED'; data: Member | { action: string; member_id: string } };
