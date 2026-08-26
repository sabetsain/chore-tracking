import uuid
from datetime import date, datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Chore, ChoreAssignment, ChoreLog, Member
from app.schemas import (
    ChoreAssignmentOut,
    ChoreCreate,
    ChoreLogCreate,
    ChoreLogOut,
    ChoreOut,
    ChoreSwapRequest,
    ChoreUpdate,
)

from app.security import get_current_member
from app.services.chore_service import get_current_week_start, get_or_generate_weekly_assignments
from app.websocket import ws_manager

router = APIRouter(prefix="/api/v1/chores", tags=["chores"])


@router.get("/assignments", response_model=list[ChoreAssignmentOut], status_code=status.HTTP_200_OK)
async def get_weekly_assignments(
    week_start_date: Optional[date] = None,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    target_date = get_current_week_start(week_start_date)
    return await get_or_generate_weekly_assignments(
        db=db,
        household_id=current_member.household_id,
        week_start_date=target_date,
    )


@router.get("/up-for-grabs", response_model=list[ChoreAssignmentOut], status_code=status.HTTP_200_OK)
async def get_up_for_grabs_chores(
    week_start_date: Optional[date] = None,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    target_date = get_current_week_start(week_start_date)
    assignments = await get_or_generate_weekly_assignments(
        db=db,
        household_id=current_member.household_id,
        week_start_date=target_date,
    )
    up_for_grabs = []
    for a in assignments:
        if a.status == "pending":
            if a.member_id is None:
                up_for_grabs.append(a)
            elif a.member and a.member.status == "away":
                up_for_grabs.append(a)
    return up_for_grabs


@router.post("/assignments/{assignment_id}/claim", response_model=ChoreAssignmentOut, status_code=status.HTTP_200_OK)
async def claim_chore_assignment(
    assignment_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore assignment not found in this household",
        )

    if assignment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot claim a completed or non-pending chore",
        )

    assignment.member_id = current_member.id
    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="CHORE_UPDATED",
        data={"action": "claimed", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment



@router.post("/assignments/{assignment_id}/complete", response_model=ChoreAssignmentOut, status_code=status.HTTP_200_OK)
async def complete_chore_assignment(
    assignment_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore assignment not found in this household",
        )

    assignment.status = "completed"
    assignment.completed_at = datetime.now(timezone.utc)
    assignment.completed_by_member_id = current_member.id

    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="CHORE_UPDATED",
        data={"action": "completed", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


@router.post("/assignments/{assignment_id}/swap", response_model=ChoreAssignmentOut, status_code=status.HTTP_200_OK)
async def swap_chore_assignments(
    assignment_id: uuid.UUID,
    data: ChoreSwapRequest,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    if assignment_id == data.target_assignment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot swap an assignment with itself",
        )

    # Fetch source assignment
    stmt1 = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res1 = await db.execute(stmt1)
    assignment1 = res1.scalar_one_or_none()
    if not assignment1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source chore assignment not found in this household",
        )

    # Fetch target assignment
    stmt2 = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == data.target_assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res2 = await db.execute(stmt2)
    assignment2 = res2.scalar_one_or_none()
    if not assignment2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target chore assignment not found in this household",
        )

    if assignment1.week_start_date != assignment2.week_start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignments must be in the same week to swap",
        )

    if assignment1.status != "pending" or assignment2.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot swap completed or non-pending chore assignments",
        )

    # Swap assignees
    assignment1.member_id, assignment2.member_id = assignment2.member_id, assignment1.member_id

    await db.commit()
    await db.refresh(assignment1)
    await db.refresh(assignment2)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="CHORE_UPDATED",
        data={"action": "swapped", "assignment": ChoreAssignmentOut.model_validate(assignment1).model_dump(mode="json")},
    )
    return assignment1



@router.post("/assignments/{assignment_id}/log", response_model=ChoreLogOut, status_code=status.HTTP_201_CREATED)
async def log_chore_duty(
    assignment_id: uuid.UUID,
    data: ChoreLogCreate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore assignment not found in this household",
        )

    chore_log = ChoreLog(
        assignment_id=assignment.id,
        actor_member_id=current_member.id,
        note=data.note,
    )
    db.add(chore_log)
    await db.commit()
    await db.refresh(chore_log)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="CHORE_UPDATED",
        data={"action": "logged", "log": ChoreLogOut.model_validate(chore_log).model_dump(mode="json")},
    )
    return chore_log


@router.get("/assignments/{assignment_id}/logs", response_model=list[ChoreLogOut], status_code=status.HTTP_200_OK)
async def get_chore_logs(
    assignment_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == current_member.household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore assignment not found in this household",
        )

    log_stmt = (
        select(ChoreLog)
        .where(ChoreLog.assignment_id == assignment.id)
        .order_by(ChoreLog.logged_at.desc())
    )
    log_res = await db.execute(log_stmt)
    return log_res.scalars().all()



@router.post("", response_model=ChoreOut, status_code=status.HTTP_201_CREATED)
async def create_chore(
    data: ChoreCreate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    chore = Chore(
        household_id=current_member.household_id,
        title=data.title,
        description=data.description,
        effort_weight=data.effort_weight,
        completion_type=data.completion_type,
        is_active=True,
    )
    db.add(chore)
    await db.commit()
    await db.refresh(chore)
    await ws_manager.broadcast(
        household_id=chore.household_id,
        event="CHORE_UPDATED",
        data={"action": "created", "chore": ChoreOut.model_validate(chore).model_dump(mode="json")},
    )
    return chore


@router.get("", response_model=list[ChoreOut], status_code=status.HTTP_200_OK)
async def list_chores(
    is_active: Optional[bool] = None,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Chore).where(Chore.household_id == current_member.household_id)
    if is_active is not None:
        stmt = stmt.where(Chore.is_active == is_active)
    stmt = stmt.order_by(Chore.created_at.asc())

    res = await db.execute(stmt)
    return res.scalars().all()



@router.patch("/{chore_id}", response_model=ChoreOut, status_code=status.HTTP_200_OK)
async def update_chore(
    chore_id: uuid.UUID,
    data: ChoreUpdate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Chore).where(
        Chore.id == chore_id,
        Chore.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    chore = res.scalar_one_or_none()
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found in this household",
        )

    if data.title is not None:
        chore.title = data.title
    if data.description is not None:
        chore.description = data.description
    if data.effort_weight is not None:
        chore.effort_weight = data.effort_weight
    if data.completion_type is not None:
        chore.completion_type = data.completion_type
    if data.is_active is not None:
        chore.is_active = data.is_active

    await db.commit()
    await db.refresh(chore)
    await ws_manager.broadcast(
        household_id=chore.household_id,
        event="CHORE_UPDATED",
        data={"action": "updated", "chore": ChoreOut.model_validate(chore).model_dump(mode="json")},
    )
    return chore


@router.delete("/{chore_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chore(
    chore_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Chore).where(
        Chore.id == chore_id,
        Chore.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    chore = res.scalar_one_or_none()
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found in this household",
        )

    household_id = chore.household_id
    await db.delete(chore)
    await db.commit()
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "deleted", "chore_id": str(chore_id)},
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
