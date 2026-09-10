import os
import pytest
from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine, inspect


@pytest.fixture
def alembic_config(tmp_path):
    db_file = tmp_path / "test_migration.db"
    db_url = f"sqlite:///{db_file}"

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ini_path = os.path.join(backend_dir, "alembic.ini")
    config = Config(ini_path)
    config.set_main_option(
        "script_location", os.path.join(backend_dir, "alembic")
    )
    config.set_main_option("sqlalchemy.url", db_url)

    return config, db_url


def test_migration_upgrade_and_downgrade(alembic_config):
    config, db_url = alembic_config

    # Run upgrade to head
    command.upgrade(config, "head")

    # Inspect tables created
    engine = create_engine(db_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    expected_tables = {
        "households",
        "members",
        "chores",
        "chore_assignments",
        "chore_logs",
        "appliances",
        "appliance_state_logs",
        "push_subscriptions",
        "alembic_version",
    }
    for expected in expected_tables:
        assert (
            expected in tables
        ), f"Expected table '{expected}' to exist after migration upgrade"

    # Verify columns on households table
    columns = {col["name"]: col for col in inspector.get_columns("households")}
    assert "id" in columns
    assert "name" in columns
    assert "invite_code" in columns
    assert "timezone" in columns
    assert "chore_rotation_active" in columns
    assert "created_at" in columns

    # Verify columns on members table
    member_cols = {col["name"]: col for col in inspector.get_columns("members")}
    assert "id" in member_cols
    assert "household_id" in member_cols
    assert "nickname" in member_cols
    assert "pin_hash" in member_cols
    assert "role" in member_cols
    assert "status" in member_cols
    assert "away_until" in member_cols
    assert "created_at" in member_cols

    # Verify columns on appliances table
    appliance_cols = {
        col["name"]: col for col in inspector.get_columns("appliances")
    }
    assert "id" in appliance_cols
    assert "household_id" in appliance_cols
    assert "name" in appliance_cols
    assert "type" in appliance_cols
    assert "current_state" in appliance_cols
    assert "state_updated_at" in appliance_cols
    assert "updated_by_member_id" in appliance_cols
    assert "state_step_1" in appliance_cols
    assert "state_step_2" in appliance_cols
    assert "state_step_3" in appliance_cols
    assert "state_step_4" in appliance_cols
    assert "state_step_5" in appliance_cols
    assert "timer_enabled" in appliance_cols
    assert "default_timer_minutes" in appliance_cols
    assert "timer_duration_minutes" in appliance_cols
    assert "timer_started_at" in appliance_cols
    assert "timer_ends_at" in appliance_cols

    # Run downgrade to base
    command.downgrade(config, "base")

    # Inspect tables after downgrade
    inspector = inspect(engine)
    tables_after = [
        t for t in inspector.get_table_names() if t != "alembic_version"
    ]
    assert (
        len(tables_after) == 0
    ), f"Expected all tables dropped after downgrade, got: {tables_after}"

    engine.dispose()


@pytest.mark.asyncio
async def test_async_migration_upgrade_and_downgrade(tmp_path):
    db_file = tmp_path / "test_async_migration.db"
    db_url = f"sqlite+aiosqlite:///{db_file}"

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ini_path = os.path.join(backend_dir, "alembic.ini")
    config = Config(ini_path)
    config.set_main_option(
        "script_location", os.path.join(backend_dir, "alembic")
    )
    config.set_main_option("sqlalchemy.url", db_url)

    # Upgrade
    command.upgrade(config, "head")

    # Check tables with sync engine for inspection
    sync_engine = create_engine(f"sqlite:///{db_file}")
    inspector = inspect(sync_engine)
    tables = inspector.get_table_names()
    assert "households" in tables
    assert "chores" in tables
    assert "members" in tables
    assert "chore_assignments" in tables
    assert "chore_logs" in tables
    assert "appliances" in tables
    assert "appliance_state_logs"
    assert "push_subscriptions" in tables

    # Downgrade
    command.downgrade(config, "base")
    tables_after = [
        t for t in inspect(sync_engine).get_table_names() if t != "alembic_version"
    ]
    assert len(tables_after) == 0
    sync_engine.dispose()


def test_custom_appliance_engine_backfill(alembic_config):
    config, db_url = alembic_config

    # Upgrade to 0002
    command.upgrade(config, "0002_add_chore_rotation_active")

    engine = create_engine(db_url)
    with engine.begin() as conn:
        # Insert test household
        conn.exec_driver_sql(
            "INSERT INTO households (id, name, invite_code, timezone, created_at) "
            "VALUES ('hh-1', 'Test House', 'TEST01', 'UTC', CURRENT_TIMESTAMP)"
        )
        # Insert washer with clean_needs_emptying
        conn.exec_driver_sql(
            "INSERT INTO appliances (id, household_id, name, type, current_state, state_updated_at) "
            "VALUES ('app-1', 'hh-1', 'Washer', 'washer', 'clean_needs_emptying', CURRENT_TIMESTAMP)"
        )
        # Insert dishwasher with empty
        conn.exec_driver_sql(
            "INSERT INTO appliances (id, household_id, name, type, current_state, state_updated_at) "
            "VALUES ('app-2', 'hh-1', 'Dishwasher', 'dishwasher', 'empty', CURRENT_TIMESTAMP)"
        )
        # Insert dryer with running
        conn.exec_driver_sql(
            "INSERT INTO appliances (id, household_id, name, type, current_state, state_updated_at) "
            "VALUES ('app-3', 'hh-1', 'Dryer', 'dryer', 'running', CURRENT_TIMESTAMP)"
        )

    # Upgrade to head (applies 0003)
    command.upgrade(config, "head")

    with engine.connect() as conn:
        rows = conn.exec_driver_sql(
            "SELECT id, name, type, current_state, state_step_1, state_step_2, state_step_3, "
            "timer_enabled, default_timer_minutes FROM appliances ORDER BY name"
        ).mappings().all()

        app_map = {r["name"]: r for r in rows}

        washer = app_map["Washer"]
        assert washer["current_state"] == "needs_attention"
        assert washer["state_step_1"] == "empty"
        assert washer["state_step_2"] == "running"
        assert washer["state_step_3"] == "needs_attention"
        assert bool(washer["timer_enabled"]) is True
        assert washer["default_timer_minutes"] == 45

        dishwasher = app_map["Dishwasher"]
        assert dishwasher["current_state"] == "dirty"
        assert dishwasher["state_step_1"] == "dirty"
        assert dishwasher["state_step_2"] == "running"
        assert dishwasher["state_step_3"] == "needs_attention"
        assert bool(dishwasher["timer_enabled"]) is True
        assert dishwasher["default_timer_minutes"] == 60

        dryer = app_map["Dryer"]
        assert dryer["current_state"] == "running"
        assert dryer["state_step_1"] == "empty"
        assert dryer["state_step_2"] == "running"
        assert dryer["state_step_3"] == "needs_attention"
        assert bool(dryer["timer_enabled"]) is True
        assert dryer["default_timer_minutes"] == 45

    engine.dispose()

