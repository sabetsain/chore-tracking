import uuid
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator




class HouseholdCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    nickname: str = Field(..., min_length=1, max_length=50)
    pin: Optional[str] = Field(default=None, pattern=r"^\d{4}$")


class HouseholdJoin(BaseModel):
    invite_code: str = Field(..., min_length=6, max_length=6)
    nickname: str = Field(..., min_length=1, max_length=50)
    pin: Optional[str] = Field(default=None, pattern=r"^\d{4}$")


class HouseholdOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    invite_code: str
    timezone: str
    chore_rotation_active: bool = False
    created_at: datetime


class MemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    household_id: uuid.UUID
    nickname: str
    role: str
    status: str
    away_until: Optional[datetime] = None
    created_at: datetime


class MemberMeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    household_id: uuid.UUID
    nickname: str
    role: str
    status: str
    away_until: Optional[datetime] = None
    created_at: datetime
    household: HouseholdOut


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    member: MemberOut
    household: HouseholdOut


class LoginRequest(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=50)
    pin: Optional[str] = Field(default=None, pattern=r"^\d{4}$")
    household_id: Optional[uuid.UUID] = None
    invite_code: Optional[str] = Field(default=None, min_length=6, max_length=6)


class MemberStatusUpdate(BaseModel):
    status: Literal["active", "away"]
    away_until: Optional[datetime] = None


class InviteCodeResponse(BaseModel):
    invite_code: str


class ChoreCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    effort_weight: int = Field(default=1, ge=1, le=5)
    completion_type: Literal["single_weekly", "continuous_duty"] = "single_weekly"


class ChoreUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    effort_weight: Optional[int] = Field(default=None, ge=1, le=5)
    completion_type: Optional[Literal["single_weekly", "continuous_duty"]] = None
    is_active: Optional[bool] = None


class ChoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    household_id: uuid.UUID
    title: str
    description: Optional[str] = None
    effort_weight: int
    completion_type: str
    is_active: bool
    created_at: datetime


class ChoreAssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    chore_id: uuid.UUID
    member_id: Optional[uuid.UUID] = None
    week_start_date: date
    status: str
    completed_at: Optional[datetime] = None
    completed_by_member_id: Optional[uuid.UUID] = None
    chore: ChoreOut
    member: Optional[MemberOut] = None
    completed_by_member: Optional[MemberOut] = None


class ChoreLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assignment_id: uuid.UUID
    actor_member_id: uuid.UUID
    note: Optional[str] = None
    logged_at: datetime
    actor_member: Optional[MemberOut] = None


class ChoreLogCreate(BaseModel):
    note: Optional[str] = None


class ChoreSwapRequest(BaseModel):
    target_assignment_id: uuid.UUID


class ChoreReassignRequest(BaseModel):
    member_id: uuid.UUID



CANONICAL_APPLIANCE_STATES = ("empty", "dirty", "running", "needs_attention", "clean")


class ApplianceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Optional[str] = "custom"
    icon: Optional[str] = None
    state_step_1: Optional[str] = None
    state_step_2: Optional[str] = None
    state_step_3: Optional[str] = None
    state_step_4: Optional[str] = None
    state_step_5: Optional[str] = None
    cycle_steps: Optional[list[str]] = None
    timer_enabled: bool = False
    default_timer_minutes: Optional[int] = None

    @model_validator(mode="after")
    def validate_and_populate_steps(self) -> "ApplianceCreate":
        if self.icon and (not self.type or self.type == "custom"):
            self.type = self.icon

        if self.cycle_steps is not None:
            if len(self.cycle_steps) < 2 or len(self.cycle_steps) > 5:
                raise ValueError("cycle_steps must have between 2 and 5 steps")
            for step in self.cycle_steps:
                if step not in CANONICAL_APPLIANCE_STATES:
                    raise ValueError(f"Invalid cycle step '{step}'. Must be one of {CANONICAL_APPLIANCE_STATES}")
            self.state_step_1 = self.cycle_steps[0]
            self.state_step_2 = self.cycle_steps[1]
            self.state_step_3 = self.cycle_steps[2] if len(self.cycle_steps) > 2 else None
            self.state_step_4 = self.cycle_steps[3] if len(self.cycle_steps) > 3 else None
            self.state_step_5 = self.cycle_steps[4] if len(self.cycle_steps) > 4 else None
        elif self.state_step_1 is not None or self.state_step_2 is not None:
            steps = [s for s in [self.state_step_1, self.state_step_2, self.state_step_3, self.state_step_4, self.state_step_5] if s is not None]
            if len(steps) < 2 or len(steps) > 5:
                raise ValueError("Appliance must have between 2 and 5 configured steps")
            for step in steps:
                if step not in CANONICAL_APPLIANCE_STATES:
                    raise ValueError(f"Invalid cycle step '{step}'. Must be one of {CANONICAL_APPLIANCE_STATES}")
        else:
            if self.type == "dishwasher":
                self.state_step_1 = "dirty"
                self.state_step_2 = "running"
                self.state_step_3 = "needs_attention"
                self.timer_enabled = True
                if self.default_timer_minutes is None:
                    self.default_timer_minutes = 60
            elif self.type in ("washer", "dryer"):
                self.state_step_1 = "empty"
                self.state_step_2 = "running"
                self.state_step_3 = "needs_attention"
                self.timer_enabled = True
                if self.default_timer_minutes is None:
                    self.default_timer_minutes = 45
            else:
                self.state_step_1 = "empty"
                self.state_step_2 = "running"
                self.state_step_3 = "needs_attention"
        return self


class ApplianceUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    type: Optional[str] = None
    icon: Optional[str] = None
    state_step_1: Optional[str] = None
    state_step_2: Optional[str] = None
    state_step_3: Optional[str] = None
    state_step_4: Optional[str] = None
    state_step_5: Optional[str] = None
    cycle_steps: Optional[list[str]] = None
    timer_enabled: Optional[bool] = None
    default_timer_minutes: Optional[int] = None

    @model_validator(mode="after")
    def validate_and_populate_steps(self) -> "ApplianceUpdate":
        if self.icon and not self.type:
            self.type = self.icon
        if self.cycle_steps is not None:
            if len(self.cycle_steps) < 2 or len(self.cycle_steps) > 5:
                raise ValueError("cycle_steps must have between 2 and 5 steps")
            for step in self.cycle_steps:
                if step not in CANONICAL_APPLIANCE_STATES:
                    raise ValueError(f"Invalid cycle step '{step}'. Must be one of {CANONICAL_APPLIANCE_STATES}")
            self.state_step_1 = self.cycle_steps[0]
            self.state_step_2 = self.cycle_steps[1]
            self.state_step_3 = self.cycle_steps[2] if len(self.cycle_steps) > 2 else None
            self.state_step_4 = self.cycle_steps[3] if len(self.cycle_steps) > 3 else None
            self.state_step_5 = self.cycle_steps[4] if len(self.cycle_steps) > 4 else None
        elif any(s is not None for s in [self.state_step_1, self.state_step_2, self.state_step_3, self.state_step_4, self.state_step_5]):
            steps = [s for s in [self.state_step_1, self.state_step_2, self.state_step_3, self.state_step_4, self.state_step_5] if s is not None]
            if len(steps) < 2 or len(steps) > 5:
                raise ValueError("Appliance must have between 2 and 5 configured steps")
            for step in steps:
                if step not in CANONICAL_APPLIANCE_STATES:
                    raise ValueError(f"Invalid cycle step '{step}'. Must be one of {CANONICAL_APPLIANCE_STATES}")
        return self


class ApplianceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    household_id: uuid.UUID
    name: str
    type: str
    current_state: str
    state_updated_at: datetime
    updated_by_member_id: Optional[uuid.UUID] = None
    updated_by_member: Optional[MemberOut] = None

    state_step_1: str = "empty"
    state_step_2: str = "running"
    state_step_3: Optional[str] = None
    state_step_4: Optional[str] = None
    state_step_5: Optional[str] = None

    timer_enabled: bool = False
    default_timer_minutes: Optional[int] = None
    timer_duration_minutes: Optional[int] = None
    timer_started_at: Optional[datetime] = None
    timer_ends_at: Optional[datetime] = None

    @computed_field
    @property
    def next_state(self) -> str:
        steps = [s for s in [self.state_step_1, self.state_step_2, self.state_step_3, self.state_step_4, self.state_step_5] if s]
        if not steps:
            return self.current_state
        curr = self.current_state
        if curr == "clean_needs_emptying" and "needs_attention" in steps:
            curr = "needs_attention"
        if curr not in steps:
            return steps[0]
        idx = steps.index(curr)
        return steps[(idx + 1) % len(steps)]

    @computed_field
    @property
    def icon(self) -> str:
        return self.type


class ApplianceStateUpdate(BaseModel):
    to_state: Literal["empty", "dirty", "running", "needs_attention", "clean", "clean_needs_emptying"]
    force: Optional[bool] = False
    timer_duration_minutes: Optional[int] = None


class ApplianceStateLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    appliance_id: uuid.UUID
    from_state: str
    to_state: str
    trigger_source: str
    actor_member_id: Optional[uuid.UUID] = None
    created_at: datetime
    actor_member: Optional[MemberOut] = None


class SensorEventCreate(BaseModel):
    power_watts: float = Field(..., ge=0)
    device_id: Optional[str] = None


class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh_key: Optional[str] = None
    auth_key: Optional[str] = None
    keys: Optional[PushSubscriptionKeys] = None


class PushSubscriptionDelete(BaseModel):
    endpoint: Optional[str] = None


class VapidPublicKeyResponse(BaseModel):
    public_key: str


class PushSubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    member_id: uuid.UUID
    household_id: uuid.UUID
    endpoint: str
    p256dh_key: str
    auth_key: str
    created_at: datetime



