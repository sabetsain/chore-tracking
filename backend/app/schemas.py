import uuid
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field




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


class ApplianceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["dishwasher", "washer", "dryer", "custom"] = "custom"


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


class ApplianceStateUpdate(BaseModel):
    to_state: Literal["empty", "dirty", "running", "clean_needs_emptying"]
    force: Optional[bool] = False


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



