import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment


@pytest.mark.asyncio
async def test_new_household_chores_start_unassigned_in_up_for_grabs(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Stationery House", "nickname": "Alice"},
    )
    admin_token = hh_res.json()["access_token"]
    assert hh_res.json()["household"]["chore_rotation_active"] is False

    # Create chore
    c_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Wipe Countertops", "effort_weight": 2},
    )
    chore_id = c_res.json()["id"]

    # Assignments start with member_id = None
    assign_res = await client.get(
        "/api/v1/chores/assignments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert assign_res.status_code == 200
    assignments = assign_res.json()
    assert len(assignments) == 1
    assert assignments[0]["member_id"] is None
    assert assignments[0]["status"] == "pending"

    # Up-for-grabs contains the chore
    grabs_res = await client.get(
        "/api/v1/chores/up-for-grabs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert grabs_res.status_code == 200
    assert len(grabs_res.json()) == 1
    assert grabs_res.json()[0]["chore_id"] == chore_id


@pytest.mark.asyncio
async def test_rotation_activate_deactivate_and_reshuffle_endpoints(client: AsyncClient, db_session: AsyncSession):
    # Setup household with Alice and Bob
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Lifecycle House", "nickname": "Alice"},
    )
    admin_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]
    bob_id = join_bob.json()["member"]["id"]

    # Create 2 chores
    c1 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Wash Pots", "effort_weight": 3})).json()
    c2 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Clean Sink", "effort_weight": 2})).json()

    # Chores are initially unassigned
    init_res = await client.get("/api/v1/chores/assignments", headers={"Authorization": f"Bearer {admin_token}"})
    assert all(a["member_id"] is None for a in init_res.json())

    # 1. Activate rotation
    act_res = await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})
    assert act_res.status_code == 200
    act_assignments = act_res.json()
    assert len(act_assignments) == 2
    # Verify all pending assignments are assigned to active members
    act_map = {a["chore_id"]: a["member_id"] for a in act_assignments}
    assert act_map[c1["id"]] is not None
    assert act_map[c2["id"]] is not None
    assert {act_map[c1["id"]], act_map[c2["id"]]} == {alice_id, bob_id}

    # Verify household schema has chore_rotation_active = True
    me_res = await client.get("/api/v1/members/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert me_res.json()["household"]["chore_rotation_active"] is True

    # 2. Reshuffle rotation
    reshuffle_res = await client.post("/api/v1/chores/rotation/reshuffle", headers={"Authorization": f"Bearer {admin_token}"})
    assert reshuffle_res.status_code == 200
    reshuffled = reshuffle_res.json()
    assert len(reshuffled) == 2
    assert all(a["member_id"] is not None for a in reshuffled)

    # 3. Deactivate rotation
    deact_res = await client.post("/api/v1/chores/rotation/deactivate", headers={"Authorization": f"Bearer {admin_token}"})
    assert deact_res.status_code == 200
    deact_assignments = deact_res.json()
    assert all(a["member_id"] is None for a in deact_assignments)

    # Verify household schema has chore_rotation_active = False
    me_res2 = await client.get("/api/v1/members/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert me_res2.json()["household"]["chore_rotation_active"] is False

    # Verify chores are back in Up-for-Grabs pool
    grabs_res = await client.get("/api/v1/chores/up-for-grabs", headers={"Authorization": f"Bearer {admin_token}"})
    assert len(grabs_res.json()) == 2


@pytest.mark.asyncio
async def test_greedy_lpt_partitioning_varied_weights(client: AsyncClient):
    # Setup household with 3 members: Alice (admin), Bob, Charlie
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "LPT House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]
    alice_id = create_res.json()["member"]["id"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_id = join_bob.json()["member"]["id"]

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_id = join_charlie.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})

    # Create 6 chores with weights: 5, 4, 3, 2, 1, 1
    c1 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Garage Cleanout", "effort_weight": 5})).json()
    c2 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Oven Scrub", "effort_weight": 4})).json()
    c3 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Mop Floors", "effort_weight": 3})).json()
    c4 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Vacuum Rooms", "effort_weight": 2})).json()
    c5 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Wipe Counters", "effort_weight": 1})).json()
    c6 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Take Out Trash", "effort_weight": 1})).json()

    # Week: 2026-08-23 (week_index=33, 33 % 3 == 0)
    # LPT Partitioning:
    # Bucket 0: [Garage (5), Trash (1)] -> weight 6 -> assigned to Alice (active_members[(0-0)%3] = Alice)
    # Bucket 1: [Oven (4), Counters (1)] -> weight 5 -> assigned to Bob (active_members[(1-0)%3] = Bob)
    # Bucket 2: [Mop (3), Vacuum (2)] -> weight 5 -> assigned to Charlie (active_members[(2-0)%3] = Charlie)
    week1 = "2026-08-23"
    res_w1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    assignments = res_w1.json()
    assert len(assignments) == 6

    assign_map = {a["chore_id"]: a["member_id"] for a in assignments}
    assert assign_map[c1["id"]] == alice_id
    assert assign_map[c6["id"]] == alice_id
    assert assign_map[c2["id"]] == bob_id
    assert assign_map[c5["id"]] == bob_id
    assert assign_map[c3["id"]] == charlie_id
    assert assign_map[c4["id"]] == charlie_id


@pytest.mark.asyncio
async def test_cyclical_rotation_across_multiple_weeks(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Multiweek House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]
    alice_id = create_res.json()["member"]["id"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_id = join_bob.json()["member"]["id"]

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_id = join_charlie.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})

    # 3 chores with distinct weights: Heavy (3), Medium (2), Light (1)
    c1 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Heavy", "effort_weight": 3})).json()
    c2 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Medium", "effort_weight": 2})).json()
    c3 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Light", "effort_weight": 1})).json()

    # Buckets:
    # Bucket 0: [Heavy]
    # Bucket 1: [Medium]
    # Bucket 2: [Light]

    # Week 1: 2026-08-23 (week_index=33, 33%3=0)
    # Bucket 0 -> Alice, Bucket 1 -> Bob, Bucket 2 -> Charlie
    res_w1 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    map_w1 = {a["chore_id"]: a["member_id"] for a in res_w1.json()}
    assert map_w1[c1["id"]] == alice_id
    assert map_w1[c2["id"]] == bob_id
    assert map_w1[c3["id"]] == charlie_id

    # Week 2: 2026-08-30 (week_index=34, 34%3=1)
    # Bucket 0 -> Charlie ((0-1)%3=2), Bucket 1 -> Alice ((1-1)%3=0), Bucket 2 -> Bob ((2-1)%3=1)
    res_w2 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-30",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w2.status_code == 200
    map_w2 = {a["chore_id"]: a["member_id"] for a in res_w2.json()}
    assert map_w2[c1["id"]] == charlie_id
    assert map_w2[c2["id"]] == alice_id
    assert map_w2[c3["id"]] == bob_id

    # Week 3: 2026-09-06 (week_index=35, 35%3=2)
    # Bucket 0 -> Bob ((0-2)%3=1), Bucket 1 -> Charlie ((1-2)%3=2), Bucket 2 -> Alice ((2-2)%3=0)
    res_w3 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-09-06",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w3.status_code == 200
    map_w3 = {a["chore_id"]: a["member_id"] for a in res_w3.json()}
    assert map_w3[c1["id"]] == bob_id
    assert map_w3[c2["id"]] == charlie_id
    assert map_w3[c3["id"]] == alice_id


@pytest.mark.asyncio
async def test_weekly_rotation_skips_away_member(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Skip Away House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]
    alice_id = create_res.json()["member"]["id"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]
    bob_id = join_bob.json()["member"]["id"]

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_id = join_charlie.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})

    # 1 Chore (weight 4)
    c1_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Bathroom Cleaning", "effort_weight": 4},
    )
    c1_id = c1_res.json()["id"]

    # Week 1 (2026-08-23): 3 active members, Bucket 0 -> Alice
    res_w1 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    assert res_w1.json()[0]["member_id"] == alice_id

    # Bob sets status to 'away' before Week 2
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {bob_token}"},
        json={"status": "away"},
    )

    # Week 2 (2026-08-30, week_index=34, 34%2=0):
    # Active members: [Alice (idx 0), Charlie (idx 1)] (N=2)
    # Bucket 0: [Bathroom (4)] -> assigned to active_members[(0-0)%2] = Alice
    res_w2 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-30",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w2.status_code == 200
    assert res_w2.json()[0]["member_id"] == alice_id


@pytest.mark.asyncio
async def test_weekly_rotation_all_away_sets_member_none(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "All Away House", "nickname": "SoloAlice"},
    )
    admin_token = create_res.json()["access_token"]

    # Alice sets away
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "away"},
    )

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Dusting", "effort_weight": 1},
    )

    week1 = "2026-08-23"
    res_w1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    assignments = res_w1.json()
    assert len(assignments) == 1
    assert assignments[0]["member_id"] is None
    assert assignments[0]["status"] == "pending"


@pytest.mark.asyncio
async def test_mid_week_new_chore_placement_in_lowest_bucket(client: AsyncClient):
    # Setup household with 2 members: Alice, Bob
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Midweek House", "nickname": "Alice"},
    )
    admin_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_id = join_bob.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})

    # Initial chores: c1 (weight 3), c2 (weight 2)
    c1 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Cook Dinner", "effort_weight": 3})).json()
    c2 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Dishes", "effort_weight": 2})).json()

    # Week: 2026-08-23 (week_index=33, 33%2=1)
    # Bucket 0: [Cook (3)] -> assigned to Bob ((0-1)%2=1)
    # Bucket 1: [Dishes (2)] -> assigned to Alice ((1-1)%2=0)
    w_res1 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert w_res1.status_code == 200
    asg1 = {a["chore_id"]: a["member_id"] for a in w_res1.json()}
    assert asg1[c1["id"]] == bob_id
    assert asg1[c2["id"]] == alice_id

    # Mid-week, add c3 with effort_weight 2 ("Vacuum")
    # LPT places c1(3) in Bucket 0, c2(2) in Bucket 1, c3(2) in Bucket 1 (min weight 2 < 3).
    # Bucket 1 (Alice) now has Dishes (2) and Vacuum (2), total weight 4.
    # Existing assignment for Cook (Bob) and Dishes (Alice) are preserved, Vacuum is assigned to Alice!
    c3 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {admin_token}"}, json={"title": "Vacuum", "effort_weight": 2})).json()

    w_res2 = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert w_res2.status_code == 200
    asg2 = {a["chore_id"]: a["member_id"] for a in w_res2.json()}
    assert asg2[c1["id"]] == bob_id
    assert asg2[c2["id"]] == alice_id
    assert asg2[c3["id"]] == alice_id


@pytest.mark.asyncio
async def test_reassign_chore_assignment(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Reassign House", "nickname": "Alice"},
    )
    admin_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]
    bob_id = join_bob.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {admin_token}"})

    # Create chore
    c_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Take Out Recycling", "effort_weight": 2},
    )
    chore_id = c_res.json()["id"]

    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    original_member_id = assignment["member_id"]

    # Target member to reassign to
    target_id = bob_id if original_member_id == alice_id else alice_id

    # Reassign using PATCH /assignments/{id}/reassign
    patch_res = await client.patch(
        f"/api/v1/chores/assignments/{assignment_id}/reassign",
        headers={"Authorization": f"Bearer {bob_token}"},
        json={"member_id": target_id},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["member_id"] == target_id

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert str(db_assign.member_id) == target_id

    # Attempt reassigning to a non-existent / cross-household member returns 404
    fake_member_id = str(uuid.uuid4())
    bad_res = await client.patch(
        f"/api/v1/chores/assignments/{assignment_id}/reassign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"member_id": fake_member_id},
    )
    assert bad_res.status_code == 404

    # Cross-household assignment reassignment returns 404
    other_hh = await client.post("/api/v1/households", json={"name": "Other HH", "nickname": "OtherUser"})
    other_token = other_hh.json()["access_token"]
    other_member_id = other_hh.json()["member"]["id"]

    cross_res = await client.patch(
        f"/api/v1/chores/assignments/{assignment_id}/reassign",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"member_id": other_member_id},
    )
    assert cross_res.status_code == 404


@pytest.mark.asyncio
async def test_weekly_rotation_idempotent(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Idempotent House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Mop Floor", "effort_weight": 2},
    )

    week1 = "2026-08-23"
    res1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    res2 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()[0]["id"] == res2.json()[0]["id"]

    # Verify only 1 record in DB
    all_assign = await db_session.execute(select(ChoreAssignment))
    assert len(all_assign.scalars().all()) == 1


@pytest.mark.asyncio
async def test_get_assignments_default_current_week(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Current Week House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Daily Kitchen Wipe", "effort_weight": 2},
    )

    # Calling without week_start_date
    res = await client.get(
        "/api/v1/chores/assignments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assigned_date = date.fromisoformat(data[0]["week_start_date"])
    assert assigned_date.weekday() == 6

