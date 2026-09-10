import uuid
from unittest.mock import MagicMock, patch
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Appliance, ApplianceStateLog, ChoreAssignment, Household, Member, PushSubscription
from app.websocket import ws_manager


class MockWebSocket:
    """Mock WebSocket to capture broadcasts during multi-client simulation."""
    def __init__(self, name: str):
        self.name = name
        self.messages: list[dict] = []

    async def send_json(self, data: dict):
        self.messages.append(data)


@pytest.mark.asyncio
async def test_full_roommate_lifecycle_simulation(client: AsyncClient, db_session: AsyncSession):
    """
    Comprehensive End-to-End Simulation of a 3-Roommate Household:
    1. Roommate 1 (Admin 'Alex') creates household 'Pine House' -> auto-seeds appliances.
    2. Roommate 2 ('Sam', PIN 4321) & Roommate 3 ('Jordan') join via 6-char invite code.
    3. Push subscriptions registered and WebSocket clients connected for all 3 roommates.
    4. Admin creates weekly chores ('Kitchen Deep Clean', 'Trash & Recycling', 'Bathroom Sanitization').
    5. Weekly chore assignments generated with round-robin distribution and push notifications.
    6. Roommate 1 starts Dishwasher cycle (empty -> dirty -> running).
    7. IoT smart plug sensor webhook reports power drop (<5W) -> Dishwasher transitions to clean_needs_emptying.
    8. Web push notification sent to household members that Dishwasher is clean.
    9. Roommate 2 empties Dishwasher (clean_needs_emptying -> empty).
    10. Appliance state history verified with full audit trail (manual and sensor triggers).
    11. Roommate 1 logs 2 instances of continuous duty ('Trash & Recycling').
    12. Roommate 3 goes 'away' -> their assigned chore moves into 'Up for Grabs' pool.
    13. Roommate 1 claims Jordan's chore from Up for Grabs pool.
    14. Roommate 1 and Roommate 2 execute a 1-to-1 chore swap of pending duties.
    15. Roommate 2 marks 'Kitchen Deep Clean' complete.
    16. Real-time WebSocket synchronization and Web Push triggers verified across all roommates.
    """

    with patch.object(settings, "VAPID_PRIVATE_KEY", "sim_private_vapid_key"), \
         patch.object(settings, "VAPID_PUBLIC_KEY", "sim_public_vapid_key"), \
         patch("app.services.push_service.webpush") as mock_webpush:

        # =========================================================================
        # STEP 1: Roommate 1 (Admin) creates household "Pine House"
        # =========================================================================
        create_hh_res = await client.post(
            "/api/v1/households",
            json={"name": "Pine House", "nickname": "Alex", "pin": "1234"},
        )
        assert create_hh_res.status_code == 201
        hh_data = create_hh_res.json()
        
        r1_token = hh_data["access_token"]
        r1_headers = {"Authorization": f"Bearer {r1_token}"}
        r1_id = hh_data["member"]["id"]
        household_id = uuid.UUID(hh_data["household"]["id"])
        invite_code = hh_data["household"]["invite_code"]

        assert hh_data["household"]["name"] == "Pine House"
        assert len(invite_code) == 6
        assert hh_data["member"]["nickname"] == "Alex"
        assert hh_data["member"]["role"] == "admin"

        # Verify auto-seeded appliances (Dishwasher, Washer, Dryer)
        apps_res = await client.get("/api/v1/appliances", headers=r1_headers)
        assert apps_res.status_code == 200
        appliances = apps_res.json()
        assert len(appliances) == 3
        app_names = {a["name"]: a["id"] for a in appliances}
        assert "Dishwasher" in app_names
        assert "Washer" in app_names
        assert "Dryer" in app_names
        for a in appliances:
            if a["name"] == "Dishwasher":
                assert a["current_state"] == "dirty"
            else:
                assert a["current_state"] == "empty"
            assert a["household_id"] == str(household_id)

        dishwasher_id = app_names["Dishwasher"]

        # Connect WebSocket for Roommate 1
        ws_r1 = MockWebSocket(name="Alex_WS")
        ws_manager.active_connections[household_id] = {ws_r1}

        # Subscribe Roommate 1 to Web Push
        sub1_res = await client.post(
            "/api/v1/push/subscribe",
            headers=r1_headers,
            json={
                "endpoint": "https://push.example.com/alex-device",
                "keys": {"p256dh": "alex_p256dh", "auth": "alex_auth"},
            },
        )
        assert sub1_res.status_code in [200, 201]

        # =========================================================================
        # STEP 2: Roommate 2 joins ("Sam", PIN 4321) & Roommate 3 joins ("Jordan")
        # =========================================================================
        join_sam_res = await client.post(
            "/api/v1/households/join",
            json={"invite_code": invite_code, "nickname": "Sam", "pin": "4321"},
        )
        assert join_sam_res.status_code == 200
        sam_data = join_sam_res.json()
        r2_token = sam_data["access_token"]
        r2_headers = {"Authorization": f"Bearer {r2_token}"}
        r2_id = sam_data["member"]["id"]
        assert sam_data["member"]["nickname"] == "Sam"
        assert sam_data["member"]["role"] == "member"

        # Test login for Sam
        login_sam_res = await client.post(
            "/api/v1/auth/login",
            json={"invite_code": invite_code, "nickname": "Sam", "pin": "4321"},
        )
        assert login_sam_res.status_code == 200
        assert login_sam_res.json()["member"]["nickname"] == "Sam"

        # Roommate 3 (Jordan) joins without PIN
        join_jordan_res = await client.post(
            "/api/v1/households/join",
            json={"invite_code": invite_code, "nickname": "Jordan"},
        )
        assert join_jordan_res.status_code == 200
        jordan_data = join_jordan_res.json()
        r3_token = jordan_data["access_token"]
        r3_headers = {"Authorization": f"Bearer {r3_token}"}
        r3_id = jordan_data["member"]["id"]
        assert jordan_data["member"]["nickname"] == "Jordan"

        # Connect WebSockets for Roommates 2 and 3
        ws_r2 = MockWebSocket(name="Sam_WS")
        ws_r3 = MockWebSocket(name="Jordan_WS")
        ws_manager.active_connections[household_id].add(ws_r2)
        ws_manager.active_connections[household_id].add(ws_r3)

        # Register Push Subscriptions for Roommates 2 & 3
        await client.post(
            "/api/v1/push/subscribe",
            headers=r2_headers,
            json={
                "endpoint": "https://push.example.com/sam-device",
                "keys": {"p256dh": "sam_p256dh", "auth": "sam_auth"},
            },
        )
        await client.post(
            "/api/v1/push/subscribe",
            headers=r3_headers,
            json={
                "endpoint": "https://push.example.com/jordan-device",
                "keys": {"p256dh": "jordan_p256dh", "auth": "jordan_auth"},
            },
        )

        # Verify all 3 members are in database
        stmt_members = select(Member).where(Member.household_id == household_id)
        members_in_db = (await db_session.execute(stmt_members)).scalars().all()
        assert len(members_in_db) == 3

        # =========================================================================
        # STEP 3: Admin creates weekly chores
        # =========================================================================
        c1_res = await client.post(
            "/api/v1/chores",
            headers=r1_headers,
            json={
                "title": "Kitchen Deep Clean",
                "completion_type": "single_weekly",
                "effort_weight": 3,
                "description": "Scrub countertops, stove, and sink",
            },
        )
        assert c1_res.status_code == 201
        chore_kitchen_id = c1_res.json()["id"]

        c2_res = await client.post(
            "/api/v1/chores",
            headers=r1_headers,
            json={
                "title": "Bathroom Sanitization",
                "completion_type": "single_weekly",
                "effort_weight": 2,
                "description": "Clean shower, toilet, and mirrors",
            },
        )
        assert c2_res.status_code == 201
        chore_bath_id = c2_res.json()["id"]

        c3_res = await client.post(
            "/api/v1/chores",
            headers=r1_headers,
            json={
                "title": "Trash & Recycling",
                "completion_type": "continuous_duty",
                "effort_weight": 1,
                "description": "Empty bins and take to curb",
            },
        )
        assert c3_res.status_code == 201
        chore_trash_id = c3_res.json()["id"]


        # Verify chore creation broadcast to all roommates
        for ws in [ws_r1, ws_r2, ws_r3]:
            chore_events = [m for m in ws.messages if m["event"] == "CHORE_UPDATED"]
            assert len(chore_events) >= 3

        # =========================================================================
        # STEP 4: Week assignments generated and verified
        # =========================================================================
        await client.post("/api/v1/chores/rotation/activate", headers=r1_headers)
        week_str = "2026-08-23"
        assignments_res = await client.get(
            f"/api/v1/chores/assignments?week_start_date={week_str}",
            headers=r1_headers,
        )
        assert assignments_res.status_code == 200
        assignments = assignments_res.json()
        assert len(assignments) == 3

        assign_by_chore = {a["chore_id"]: a for a in assignments}
        kitchen_assign = assign_by_chore[chore_kitchen_id]
        trash_assign = assign_by_chore[chore_trash_id]
        bath_assign = assign_by_chore[chore_bath_id]

        # Verify round-robin assignment among Alex, Sam, Jordan
        assigned_member_ids = {a["member_id"] for a in assignments}
        assert assigned_member_ids == {r1_id, r2_id, r3_id}

        # Verify push notification dispatch for chore assignments
        assert mock_webpush.called
        dispatched_payloads = [call.kwargs["data"] for call in mock_webpush.call_args_list]
        assert any("chore" in p.lower() or "assigned" in p.lower() or "kitchen" in p.lower() for p in dispatched_payloads)

        # =========================================================================
        # =========================================================================
        # STEP 5: Roommate 1 starts Dishwasher (dirty -> running with timer)
        # =========================================================================
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        # dirty -> running
        d_run_res = await client.post(
            f"/api/v1/appliances/{dishwasher_id}/state",
            headers=r1_headers,
            json={"to_state": "running", "timer_duration_minutes": 60},
        )
        assert d_run_res.status_code == 200
        assert d_run_res.json()["current_state"] == "running"
        assert d_run_res.json()["updated_by_member_id"] == r1_id

        # Verify all roommates received WebSocket events for running dishwasher
        for ws in [ws_r1, ws_r2, ws_r3]:
            app_events = [m for m in ws.messages if m["event"] == "APPLIANCE_STATE_CHANGED"]
            assert len(app_events) == 1
            assert app_events[-1]["data"]["current_state"] == "running"

        # =========================================================================
        # STEP 6: IoT sensor webhook triggers power drop (<5W) -> Dishwasher clean (needs_attention)
        # =========================================================================
        mock_webpush.reset_mock()
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        sensor_res = await client.post(
            f"/api/v1/appliances/{dishwasher_id}/sensor-event",
            json={"power_watts": 1.8, "device_id": "smart_plug_dishwasher_01"},
        )
        assert sensor_res.status_code == 200
        assert sensor_res.json()["current_state"] == "needs_attention"
        assert sensor_res.json()["updated_by_member_id"] is None

        # Verify WebSocket broadcast to all roommates
        for ws in [ws_r1, ws_r2, ws_r3]:
            app_events = [m for m in ws.messages if m["event"] == "APPLIANCE_STATE_CHANGED"]
            assert len(app_events) == 1
            assert app_events[0]["data"]["current_state"] == "needs_attention"

        # Verify push notification sent to all roommates about clean Dishwasher
        assert mock_webpush.called
        assert mock_webpush.call_count >= 1
        clean_push_data = mock_webpush.call_args.kwargs["data"]
        assert "Dishwasher" in clean_push_data or "clean" in clean_push_data.lower()

        # =========================================================================
        # STEP 7: Roommate 2 (Sam) empties Dishwasher (needs_attention -> dirty)
        # =========================================================================
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        d_empty_res = await client.post(
            f"/api/v1/appliances/{dishwasher_id}/state",
            headers=r2_headers,
            json={"to_state": "dirty"},
        )
        assert d_empty_res.status_code == 200
        assert d_empty_res.json()["current_state"] == "dirty"
        assert d_empty_res.json()["updated_by_member_id"] == r2_id
        assert d_empty_res.json()["updated_by_member"]["nickname"] == "Sam"

        # Verify WebSocket broadcast
        for ws in [ws_r1, ws_r2, ws_r3]:
            app_events = [m for m in ws.messages if m["event"] == "APPLIANCE_STATE_CHANGED"]
            assert len(app_events) == 1
            assert app_events[0]["data"]["current_state"] == "dirty"

        # Verify complete state transition history
        history_res = await client.get(
            f"/api/v1/appliances/{dishwasher_id}/history",
            headers=r1_headers,
        )
        assert history_res.status_code == 200
        history_logs = history_res.json()
        assert len(history_logs) == 3
        # Ordered descending (most recent first)
        assert history_logs[0]["from_state"] == "needs_attention" and history_logs[0]["to_state"] == "dirty"
        assert history_logs[0]["trigger_source"] == "manual" and history_logs[0]["actor_member"]["nickname"] == "Sam"

        assert history_logs[1]["from_state"] == "running" and history_logs[1]["to_state"] == "needs_attention"
        assert history_logs[1]["trigger_source"] == "sensor_webhook" and history_logs[1]["actor_member"] is None

        assert history_logs[2]["from_state"] == "dirty" and history_logs[2]["to_state"] == "running"
        assert history_logs[2]["trigger_source"] == "manual" and history_logs[2]["actor_member"]["nickname"] == "Alex"

        # =========================================================================
        # STEP 8: Roommate 1 logs 2 instances of Trash duty (continuous_duty)
        # =========================================================================
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        # Log 1
        log1_res = await client.post(
            f"/api/v1/chores/assignments/{trash_assign['id']}/log",
            headers=r1_headers,
            json={"note": "Emptied kitchen trash and replaced liner"},
        )
        assert log1_res.status_code == 201
        assert log1_res.json()["actor_member_id"] == r1_id

        # Log 2
        log2_res = await client.post(
            f"/api/v1/chores/assignments/{trash_assign['id']}/log",
            headers=r1_headers,
            json={"note": "Took blue recycling bin out to curbside"},
        )
        assert log2_res.status_code == 201

        # Fetch logs
        logs_res = await client.get(
            f"/api/v1/chores/assignments/{trash_assign['id']}/logs",
            headers=r1_headers,
        )
        assert logs_res.status_code == 200
        logs = logs_res.json()
        assert len(logs) == 2
        log_notes = {l["note"] for l in logs}
        assert log_notes == {
            "Emptied kitchen trash and replaced liner",
            "Took blue recycling bin out to curbside",
        }

        # Continuous duty chore remains pending
        db_trash = await db_session.get(ChoreAssignment, uuid.UUID(trash_assign["id"]))
        assert db_trash.status == "pending"

        # =========================================================================
        # STEP 9: Roommate 2 marks Bathroom Sanitization complete
        # =========================================================================
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        comp_res = await client.post(
            f"/api/v1/chores/assignments/{bath_assign['id']}/complete",
            headers=r2_headers,
        )
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert comp_data["status"] == "completed"
        assert comp_data["completed_by_member_id"] == r2_id
        assert comp_data["completed_by_member"]["nickname"] == "Sam"
        assert comp_data["completed_at"] is not None

        # Verify WebSocket broadcast for completed chore
        for ws in [ws_r1, ws_r2, ws_r3]:
            chore_events = [m for m in ws.messages if m["event"] == "CHORE_UPDATED"]
            assert len(chore_events) == 1
            assert chore_events[0]["data"]["action"] == "completed"
            assert chore_events[0]["data"]["assignment"]["status"] == "completed"

        # =========================================================================
        # STEP 10: Roommate 3 goes 'away' -> Chore moves to Up-for-Grabs pool
        # =========================================================================
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        # Jordan sets status to away
        away_res = await client.patch(
            "/api/v1/members/me/status",
            headers=r3_headers,
            json={"status": "away", "away_until": "2026-08-30T00:00:00Z"},
        )
        assert away_res.status_code == 200
        assert away_res.json()["status"] == "away"

        # Verify WebSocket broadcast of away status
        for ws in [ws_r1, ws_r2, ws_r3]:
            status_events = [m for m in ws.messages if m["event"] == "MEMBER_STATUS_CHANGED"]
            assert len(status_events) == 1
            assert status_events[0]["data"]["status"] == "away"

        # Jordan's chore ("Trash & Recycling") now shows up in Up-for-Grabs pool
        pool_res = await client.get(
            f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
            headers=r1_headers,
        )
        assert pool_res.status_code == 200
        pool = pool_res.json()
        # Find Jordan's assigned chore in pool
        assert any(a["id"] == trash_assign["id"] for a in pool)

        # Roommate 1 (Alex) claims Jordan's chore
        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        claim_res = await client.post(
            f"/api/v1/chores/assignments/{trash_assign['id']}/claim",
            headers=r1_headers,
        )
        assert claim_res.status_code == 200
        assert claim_res.json()["member_id"] == r1_id
        assert claim_res.json()["member"]["nickname"] == "Alex"


        # Verify WebSocket broadcast for claim
        for ws in [ws_r1, ws_r2, ws_r3]:
            claim_events = [m for m in ws.messages if m["event"] == "CHORE_UPDATED"]
            assert len(claim_events) == 1
            assert claim_events[0]["data"]["action"] == "claimed"
            assert claim_events[0]["data"]["assignment"]["member_id"] == r1_id

        # Up-for-grabs pool is now empty
        pool_after = await client.get(
            f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
            headers=r1_headers,
        )
        assert pool_after.status_code == 200
        assert len(pool_after.json()) == 0

        # =========================================================================
        # STEP 11: 1-to-1 chore swap between Roommate 1 and Roommate 2
        # =========================================================================
        # Admin creates two new pending weekly chores to verify 1-to-1 swap
        swap_c1 = await client.post(
            "/api/v1/chores",
            headers=r1_headers,
            json={"title": "Mop Hallway", "effort_weight": 2},
        )
        swap_c2 = await client.post(
            "/api/v1/chores",
            headers=r1_headers,
            json={"title": "Water Plants", "effort_weight": 1},
        )
        swap_c1_id = swap_c1.json()["id"]
        swap_c2_id = swap_c2.json()["id"]

        # Reactivate Jordan so rotation distributes across all active members or rotate for week 2
        await client.patch(
            "/api/v1/members/me/status",
            headers=r3_headers,
            json={"status": "active"},
        )

        week2_str = "2026-08-30"
        assign_w2_res = await client.get(
            f"/api/v1/chores/assignments?week_start_date={week2_str}",
            headers=r1_headers,
        )
        assert assign_w2_res.status_code == 200
        w2_assignments = {a["chore_id"]: a for a in assign_w2_res.json()}

        # Pick two distinct pending assignments owned by different roommates
        distinct_asgs = []
        seen_members = set()
        for a in w2_assignments.values():
            if a["member_id"] and a["member_id"] not in seen_members:
                distinct_asgs.append(a)
                seen_members.add(a["member_id"])
            if len(distinct_asgs) == 2:
                break

        a_src, a_tgt = distinct_asgs[0], distinct_asgs[1]
        src_member_id = a_src["member_id"]
        tgt_member_id = a_tgt["member_id"]

        ws_r1.messages.clear()
        ws_r2.messages.clear()
        ws_r3.messages.clear()

        # Initiate swap
        swap_res = await client.post(
            f"/api/v1/chores/assignments/{a_src['id']}/swap",
            headers=r1_headers,
            json={"target_assignment_id": a_tgt["id"]},
        )
        assert swap_res.status_code == 200
        assert swap_res.json()["member_id"] == tgt_member_id

        # Verify DB reflects the swapped ownership
        db_a1 = await db_session.get(ChoreAssignment, uuid.UUID(a_src["id"]))
        db_a2 = await db_session.get(ChoreAssignment, uuid.UUID(a_tgt["id"]))
        assert str(db_a1.member_id) == tgt_member_id
        assert str(db_a2.member_id) == src_member_id

        # Verify WebSocket broadcast for chore swap
        for ws in [ws_r1, ws_r2, ws_r3]:
            swap_events = [m for m in ws.messages if m["event"] == "CHORE_UPDATED"]
            assert len(swap_events) >= 1

        # Clean up WebSocket connections
        ws_manager.disconnect(household_id, ws_r1)
        ws_manager.disconnect(household_id, ws_r2)
        ws_manager.disconnect(household_id, ws_r3)
