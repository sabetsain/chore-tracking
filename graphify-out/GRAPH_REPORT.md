# Graph Report - workspace  (2026-09-10)

## Corpus Check
- 70 files · ~125,976 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1263 nodes · 2409 edges · 110 communities (85 shown, 16 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 268 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 91
- Community 94
- Community 95
- Community 97
- Community 98
- Community 100
- Community 101
- Community 102
- Community 104
- Community 105
- Community 106
- Community 108
- Community 109

## God Nodes (most connected - your core abstractions)
1. `Member` - 67 edges
2. `Household` - 38 edges
3. `ChoreAssignment` - 36 edges
4. `Chore` - 33 edges
5. `react` - 29 edges
6. `Appliance` - 26 edges
7. `vitest` - 24 edges
8. `PushSubscription` - 22 edges
9. `ApplianceStateLog` - 21 edges
10. `@testing-library/react` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Zero-Friction Roommate Onboarding & Auth` --semantically_similar_to--> `Requirement: Roommate Join via Invite Code`  [INFERRED] [semantically similar]
  README.md → openspec/specs/household-core/spec.md
- `Intelligent Chore Rotation & Tracking` --semantically_similar_to--> `Requirement: Weekly Duty Assignment and Fair Rotation`  [INFERRED] [semantically similar]
  README.md → openspec/specs/chore-management/spec.md
- `Real-Time Live Sync & Web Push Notifications` --semantically_similar_to--> `Requirement: Real-Time In-App WebSocket Broadcasting`  [INFERRED] [semantically similar]
  README.md → openspec/specs/notification-system/spec.md
- `4-State Shared Appliance Tracking` --semantically_similar_to--> `Requirement: 4-State Core Appliance State Machine`  [INFERRED] [semantically similar]
  README.md → openspec/specs/appliance-tracking/spec.md
- `openspec-onboard Skill` --semantically_similar_to--> `/opsx-onboard Command`  [INFERRED] [semantically similar]
  .opencode/skills/openspec-onboard/SKILL.md → .opencode/commands/opsx-onboard.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OpenSpec Core Domain Capabilities** — openspec_specs_household_core_spec_household_core, openspec_specs_chore_management_spec_chore_management, openspec_specs_appliance_tracking_spec_appliance_tracking, openspec_specs_notification_system_spec_notification_system [EXTRACTED 1.00]
- **Hybrid Development Orchestration Flow** — scripts_dev, scripts_wait_for_db, scripts_migrate, docker_compose_profiles, developer_environment_hybrid_setup [EXTRACTED 1.00]
- **OpenSpec Change Lifecycle Flow** — _agent_skills_openspec_new_change_skill_skill, _agent_skills_openspec_continue_change_skill_skill, _agent_skills_openspec_apply_change_skill_skill, _agent_skills_openspec_verify_change_skill_skill, _agent_skills_openspec_sync_specs_skill_skill, _agent_skills_openspec_archive_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Ideation to Specification Transition** — _agent_skills_openspec_explore_skill_skill, _agent_skills_openspec_explore_skill_discovery_mindset, _agent_skills_openspec_explore_skill_artifact_decision_capture, _agent_skills_openspec_new_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Verification Dimensions Framework** — _agent_skills_openspec_verify_change_skill_three_dimensional_verification, _agent_skills_openspec_verify_change_skill_issue_severity_classification, _agent_skills_openspec_verify_change_skill_graceful_degradation [EXTRACTED 1.00]
- **Appliance IoT Sensor & Push Notification Flow** — openspec_specs_appliance_tracking_spec_four_state_machine, openspec_specs_appliance_tracking_spec_sensor_webhook, openspec_specs_notification_system_spec_appliance_push_notifications, openspec_specs_notification_system_spec_websocket_broadcasting [INFERRED 0.85]
- **OpenSpec Alternative Workflows** — _opencode_commands_opsx_explore_explore_command, _opencode_commands_opsx_ff_ff_command, _opencode_commands_opsx_sync_sync_command, _opencode_commands_opsx_bulk_archive_bulk_archive_command [INFERRED 0.85]
- **OpenSpec Core Skills Suite** — _opencode_skills_openspec_new_change_skill_new_change_skill, _opencode_skills_openspec_continue_change_skill_continue_change_skill, _opencode_skills_openspec_apply_change_skill_apply_change_skill, _opencode_skills_openspec_verify_change_skill_verify_change_skill, _opencode_skills_openspec_archive_change_skill_archive_change_skill, _opencode_skills_openspec_onboard_skill_onboard_skill [INFERRED 0.95]
- **OpenSpec Standard Change Pipeline** — _opencode_commands_opsx_new_new_command, _opencode_commands_opsx_continue_continue_command, _opencode_commands_opsx_apply_apply_command, _opencode_commands_opsx_verify_verify_command, _opencode_commands_opsx_archive_archive_command [INFERRED 0.95]

## Communities (110 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (72): Chore, ChoreAssignment, ChoreLog, Household, Member, activate_rotation(), claim_chore_assignment(), complete_chore_assignment() (+64 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (38): Appliance, ApplianceStateLog, create_appliance(), get_appliance_history(), ingest_sensor_event(), list_appliances(), AsyncSession, post (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (44): Decision: Python FastAPI Backend, Decision: Invite Code + Nickname & PIN Authentication, Decision: Multi-Household Scoped PostgreSQL Database, Decision: In-Memory WebSocket Rooms per Household, Decision: Weekly Duty Responsibility Shifts, Database Schema Design (ERD), MVP System Architecture & Design, MVP Household Coordination Proposal (+36 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (27): ApiError, request(), AddApplianceModal(), AddApplianceModalProps, CANONICAL_STATES, ICON_OPTIONS, PRESET_TEMPLATES, ApplianceCard() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (35): /opsx-apply Command, Store Selection Mechanism, Task-Driven Implementation Flow, /opsx-archive Command, Change Archival Workflow, Pre-Archive Validation Check, Batch Change Archival Workflow, /opsx-bulk-archive Command (+27 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (23): ChoreDutyView(), ChoreDutyViewProps, ChoreLogModal(), ChoreLogModalProps, ChoreSwapModal(), ChoreSwapModalProps, CreateChoreModal(), CreateChoreModalProps (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (23): getDeterministicTilt(), getDeterministicVariant(), IdentitySticker(), IdentityStickerProps, IdentityStickerVariant, VARIANT_CLASSES, VARIANTS, DEFAULT_LABELS (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (21): api, getStoredToken(), setStoredToken(), App(), MainApp(), queryClient, RootView(), EditChoreModal() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (20): health_check(), get, decode_access_token(), ConnectionManager, Any, UUID, websocket_endpoint(), MockWebSocket (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (26): Any, PushSubscription, create_appliance_payload(), create_appliance_timer_payload(), create_chore_payload(), notify_household_appliance_clean(), notify_household_appliance_timer_complete(), notify_member_chore_assignment() (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (14): Header(), HeaderProps, NavTab, SettingsView(), SettingsViewProps, NotebookTab(), NotebookTabProps, AuthContextType (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (20): do_run_migrations(), Run migrations in 'offline' mode., Run migrations in 'online' mode using async engine., Run migrations in 'online' mode using sync engine., Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (23): 1. Executive Roadmap Vision & Philosophy, 2.1 Overview & Motivation, 2.2 Functional Architecture & State Graph Builder, 2. Feature Specification: Fully Customizable Appliance Engine, 3.1 Effort Weight Karma & Bidding Market, 3.2 Chore Check-Off with Polaroid/Receipt Photo Proof, 3.3 Grace Periods & Adaptive Away Rotations, 3. Feature Specification: Advanced Chore Economics & Ledger (+15 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (22): Purpose, Requirement: Editorial Typographic Hierarchy and 24px Baseline Grid, Requirement: Micro-Haptic Signatures, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Velocity-Sensitive Multi-Sensory Audio, Requirement: Zero-Latency Optimistic UI Mutations, Requirements (+14 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (21): 10% Tactile Complementary Accents (Sage Green & Slate Navy Palette), 1. Core Vision & Design Philosophy, 2.1 The "Quiet Canvas" Rule, 2.2 Mobile-First Touch Ergonomics, 2. Spatial Architecture & Layout Principles, 30% Structural Neutrals, 3.1 Color Palette Values, 3.2 Rules for Preventing Color Clashing (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Interactive Component Presentation & Functional Integrity, Requirement: Lightweight CSS 3D Page Turn Engine, Requirement: Procedural Web Audio Sound Engine, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Typographic Hierarchy and 24px Baseline Grid, Scenario: 1-tap appliance state advancement with stamp animation (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: 4-State Ergonomic Button System, Requirement: 60-30-10 Warm Anti-Glare Color Palette, Requirement: IdentitySticker Primitive for Roommates and Chores, Requirement: Intentional Negative Space and Seamless Unified Canvas, Requirement: StatusStamp Primitive for System State Output, Requirement: Zero-Dependency Web Audio Synthesizer, Requirements (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (18): name, private, type, version, autoprefixer, jsdom, postcss, react-dom (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (15): ApplianceCreate, ApplianceStateLogOut, ApplianceStateUpdate, ApplianceUpdate, ChoreCreate, ChoreLogCreate, ChoreLogOut, ChoreReassignRequest (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (17): ADDED Requirements, MODIFIED Requirements, Requirement: Core Appliance State Machine, Requirement: Mandatory Run Timers and Human Confirmation, Requirement: Preset and Custom Appliance Management, Scenario: Aborting / Resetting an active cycle, Scenario: Advancing appliance to its deterministic next state, Scenario: Creating a custom appliance with a linear cycle (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.19
Nodes (13): Hybrid Development Setup, Docker Compose Profiles, cleanup(), resolve_frontend(), resolve_uvicorn(), run_migrations(), dev.sh script, start_backend() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event (+8 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (15): ADDED Requirements, MODIFIED Requirements, Requirement: Collaborative Weekly Chore Reassignment, Requirement: Dynamic Bucket Placement for New Chores, Requirement: Hybrid Completion Tracking, Requirement: Weekly Duty Assignment and Fair Rotation, Scenario: Adding a chore mid-week, Scenario: Away member handling in bucket rotation (+7 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (14): get_vapid_public_key(), AsyncSession, delete, get, post, subscribe(), unsubscribe(), PushSubscriptionCreate (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.34
Nodes (14): AsyncClient, asyncio, AsyncSession, test_chore_unauthenticated_returns_401(), test_create_chore_auto_generates_weekly_assignment(), test_create_chore_continuous_duty(), test_create_chore_success(), test_create_chore_validation_effort_weight() (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.36
Nodes (13): AsyncClient, asyncio, AsyncSession, test_cyclical_rotation_across_multiple_weeks(), test_get_assignments_default_current_week(), test_greedy_lpt_partitioning_varied_weights(), test_mid_week_new_chore_placement_in_lowest_bucket(), test_new_household_chores_start_unassigned_in_up_for_grabs() (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.35
Nodes (13): AsyncClient, asyncio, AsyncSession, test_delete_member_as_admin_success(), test_delete_member_as_member_forbidden(), test_delete_member_cross_household_returns_404(), test_delete_nonexistent_member_returns_404(), test_regenerate_invite_code_as_admin() (+5 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (13): ambient-hardware-pwa-integration Specification, Purpose, Requirement: Countertop Screen Wake Lock Kiosk Mode, Requirement: Dynamic App Icon Badging, Requirement: Interactive Push Notification Action Handlers, Requirement: Native Web Share API Export, Requirements, Scenario: Clearing app badge when no action required (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Inertial Touch Gesture Page Turns, Requirement: Spring Physics and Shared Element Transitions, Requirement: Tension-Based Drag to Claim, Requirements, Scenario: Dragging sticky note past tear-off threshold, Scenario: Expanding appliance card into detailed slip, Scenario: Morphing chore card into swap proposal slip (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.36
Nodes (12): AsyncClient, asyncio, AsyncSession, test_appliances_unauthenticated_returns_401(), test_create_custom_appliance_default_type(), test_create_custom_appliance_invalid_steps_fails(), test_create_custom_appliance_success(), test_create_custom_appliance_with_cycle_steps_and_timer() (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.26
Nodes (11): delete_member(), get_me(), AsyncSession, delete, get, patch, UUID, update_my_status() (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Countertop Screen Wake Lock Kiosk Mode, Requirement: Dynamic App Icon Badging, Requirement: Interactive Push Notification Action Handlers, Requirement: Native Web Share API Export, Scenario: Clearing app badge when no action required, Scenario: Disabling countertop kiosk mode or tab visibility lost, Scenario: Emptying appliance directly from OS notification (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Inertial Touch Gesture Page Turns, Requirement: Spring Physics and Shared Element Transitions, Requirement: Tension-Based Drag to Claim, Scenario: Dragging sticky note past tear-off threshold, Scenario: Expanding appliance card into detailed slip, Scenario: Morphing chore card into swap proposal slip, Scenario: Releasing drag below threshold (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (11): Context, Decision 1: Positional Step Slots (`state_step_1` .. `state_step_5`) on `appliances`, Decision 2: Canonical Universe of Supported States, Decision 3: Deterministic Next-State Computation, Decision 4: Mandatory Run Timer & Confirmation Gate, Decision 5: Cycle Interruption / Abort Action, Decision 6: Editing Cycle Steps with Auto-Reset Safeguard, Decision 7: Legacy Appliance Migration Strategy (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.17
Nodes (11): generative-stationery-rendering Specification, Purpose, Requirement: Micro-Particle Paper Fleck Bursts, Requirement: Organic Continuous Duty Tally Mark Clusters, Requirement: Procedural Hand-Drawn Inking, Requirements, Scenario: Animating pencil scribble strikethrough, Scenario: Rendering diagonal crossbar on fifth tally (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.27
Nodes (7): login(), AsyncSession, post, LoginRequest, create_access_token(), require_admin(), verify_pin()

### Community 38 - "Community 38"
Cohesion: 0.35
Nodes (10): create_household(), join_household(), AsyncSession, Member, post, regenerate_invite_code(), AuthResponse, HouseholdCreate (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.44
Nodes (10): AsyncClient, asyncio, test_get_current_member_me_authenticated(), test_get_current_member_me_invalid_token(), test_get_current_member_me_unauthenticated(), test_login_missing_pin_when_required(), test_login_with_household_id_and_correct_pin(), test_login_with_incorrect_pin() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (11): dependencies, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom, roughjs (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.47
Nodes (9): AsyncClient, asyncio, AsyncSession, test_complete_and_log_cross_household_returns_404(), test_complete_by_admin_even_if_assigned_to_other(), test_complete_by_assigned_member_success(), test_complete_by_non_assigned_non_admin_fails_403(), test_log_continuous_duty_chore() (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.47
Nodes (9): AsyncClient, asyncio, AsyncSession, test_create_household_invalid_pin(), test_create_household_success(), test_create_household_without_pin(), test_join_household_duplicate_nickname(), test_join_household_invalid_invite_code() (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.60
Nodes (6): usePushNotifications(), getPushSubscription(), isPushSupported(), subscribeToPush(), unsubscribeFromPush(), urlBase64ToUint8Array()

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (9): Context, Decision 1: Pure CSS 3D Transforms over Three.js / WebGL, Decision 2: Procedural Web Audio API over Audio Asset Bundling, Decision 3: Modular Stationery Component Primitives (`frontend/src/components/stationery/`), Decision 4: CSS Variable Token Bridge with Tailwind Config Extension, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Core Appliance State Machine, Requirement: Preset and Custom Appliance Management, Scenario: Adding a preset appliance, Scenario: Advancing dishwasher through streamlined cycle, Scenario: Advancing washer or dryer through cycle with ready stamp, Scenario: Creating a household with default appliance presets, Scenario: Disallowing custom appliance type creation in standard UI (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (9): 1. Framer Motion for Spring Physics and Layout Morphing, 2. Rough.js for Procedural Hand-Drawn Inking & Tally Marks, 3. Procedural Multi-Sensory Audio & Micro-Haptics, 4. Progressive Enhancement for Hardware & PWA APIs, Context, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Micro-Particle Paper Fleck Bursts, Requirement: Organic Continuous Duty Tally Mark Clusters, Requirement: Procedural Hand-Drawn Inking, Scenario: Animating pencil scribble strikethrough, Scenario: Rendering diagonal crossbar on fifth tally, Scenario: Rendering organic hand-drawn checkboxes, Scenario: Rendering tally mark vertical strokes (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Micro-Haptic Signatures, Requirement: Velocity-Sensitive Multi-Sensory Audio, Requirement: Zero-Latency Optimistic UI Mutations, Scenario: Heavy action resonance modulation, Scenario: Optimistic appliance state advancement, Scenario: Pencil checkbox toggle haptic tick, Scenario: Rapid sequential checkoff sound variation (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.20
Nodes (9): 1. Architectural Approach, 2. CSS Variable Overhaul (`frontend/src/index.css`), 3.1 `StatusStamp.tsx`, 3.2 `IdentitySticker.tsx`, 3.3 The 4-State Button Pattern, 3. Tactile Primitives Specification, 4. Web Audio Synthesizer (`soundEffects.ts`), 5. Deprecation & Cleanup Plan (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (9): Fast-Forward Artifact Generation, Skill: openspec-ff-change, Change Initialization & Scaffolding, OpenSpec Schema Selection, Skill: openspec-new-change, Fast-Forward Artifact Creation Procedure, Workflow: opsx-ff, New Change Creation Procedure (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_swap_chore_assignments_success(), test_swap_chore_different_weeks_fails(), test_swap_chore_same_assignment_fails(), test_swap_completed_chore_fails(), test_swap_cross_household_returns_404()

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (8): 1. Foundation & Asset Setup, 2. Stationery Component Primitives, 3. Procedural Sound Engine & CSS 3D Navigation, 4. Appliance Dashboard Refactoring, 5. Chore Duty View & Ruled Paper Refactoring, 6. Up-For-Grabs Memo Board & Paperclipped Modals, 7. Onboarding Cover & Settings Refactoring, 8. Verification & Visual Audit

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (8): Context, Decision 1: Restrict Appliance Creation in Frontend vs. Backend Schema, Decision 2: Dishwasher State Machine Streamlining, Decision 3: Washer & Dryer Stamp Clarity, Decision 4: Chore Creation UI & Current Week Assignment Seeding, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (8): 1. Partitioning Strategy: Greedy LPT (Longest Processing Time) Bucket Partitioning, 2. Cyclical Weekly Rotation, 3. Separation of Persistent Buckets and Transient Weekly Overrides, 4. Assigned Member Check / Uncheck Authorization, Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 56 - "Community 56"
Cohesion: 0.46
Nodes (7): AsyncClient, asyncio, AsyncSession, test_claim_completed_chore_fails(), test_up_for_grabs_cross_household_returns_404(), test_up_for_grabs_pool_and_claim_unassigned(), test_up_for_grabs_pool_includes_away_member_chores()

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (7): 1. Dependencies and Foundation Setup, 2. Spring Physics and Layout Animations, 3. Generative Inking, Checkboxes and Tally Clusters, 4. Gesture Physics and Swipe Navigation, 5. Multi-Sensory Audio and Micro-Haptics, 6. Ambient Hardware and PWA Integrations, 7. Verification and Testing

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (7): Change Selection & Prompting, Task Implementation Loop, Planning Context & Artifact Loader, Skill: openspec-apply-change, Task Progress Tracking & Checkbox Updates, Apply Task Execution Procedure, Workflow: opsx-apply

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (4): alembic_config(), asyncio, test_async_migration_upgrade_and_downgrade(), fixture

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (5): COVER_STYLES, CoverStyle, Onboarding(), OnboardingProps, Tab

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 66 - "Community 66"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 69 - "Community 69"
Cohesion: 0.40
Nodes (6): Batch Conflict Analysis & Ordering, Candidate Change Discovery & Filtering, Sequential Batch Archival Execution, Skill: openspec-bulk-archive-change, Bulk Archival Procedure, Workflow: opsx-bulk-archive

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (6): Artifact Decision Capture Mapping, Discovery Mindset & Exploratory Reasoning, Skill: openspec-explore, Visual Architecture & Flow Diagramming, Explore Dialogue Procedure, Workflow: opsx-explore

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (6): OpenSpec CLI Command Reference, Delta Spec Concepts & Formatting, Guided Onboarding Lifecycle Walkthrough, Skill: openspec-onboard, Interactive Onboarding Tutorial Procedure, Workflow: opsx-onboard

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (6): Graceful Degradation & Verification Heuristics, Issue Severity Classification (Critical/Warning/Suggestion), Skill: openspec-verify-change, Three-Dimensional Verification Framework, Implementation Verification Procedure, Workflow: opsx-verify

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (5): 1. Database Schema & Migration, 2. Backend API & Transition Validation, 3. Frontend Types, Rubber Stamps, & Timer Engine, 4. Guided "Add & Edit Appliance" Modal UI, 5. Verification & Testing

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (5): Implementation Tasks: Warm Minimalist UI Revamp, Phase 1: Design Tokens & CSS Overhaul, Phase 2: Core Components & Audio Synthesis (TDD), Phase 3: Appliance & Chore View Modernization, Phase 4: Verification & Regression Testing

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (5): Change Archival Sequence, Pre-Archive Verification Guard, Skill: openspec-archive-change, Archive Change Procedure, Workflow: opsx-archive

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (5): Artifact Schema Validation, Schema Progression & Next Artifact Resolution, Skill: openspec-continue-change, Continue Next Artifact Procedure, Workflow: opsx-continue

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (5): Delta Specs Format (Added/Modified/Removed), Intelligent Delta Spec Merging, Skill: openspec-sync-specs, Sync Specs to Main Procedure, Workflow: opsx-sync

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 79 - "Community 79"
Cohesion: 0.60
Nodes (3): ConfettiOptions, triggerPaperDustCelebration(), canvas-confetti

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does Member connect Core Database Models & Chore Service to Backend API Routers & Alembic Environment, Household Creation & Join Tests, Member Admin & Permissions Tests, and Web Push Subscriptions & Notification Service?, Source Nodes

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Chore Definition and Configuration, Scenario: Creating a new chore from UI, Scenario: Immediate assignment generation on chore creation

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (4): 1. Backend Transition & Chore Assignment Adjustments, 2. Appliance UI & Rubber Stamp Improvements, 3. Chore Creation UI Implementation, 4. End-to-End Verification & Graph Update

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (4): Exploratory Thinking & Ideation Mode, /opsx-explore Command, openspec-explore Skill, Thinking Partner Protocol

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (4): Delta Spec Synchronization, /opsx-sync Command, Delta Sync Protocol, openspec-sync-specs Skill

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (3): AsyncClient, asyncio, test_health_check()

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): 1. Backend Core & API Implementation (TDD), 2. Frontend Stationery UI & Interaction (TDD), 3. End-to-End Verification & Knowledge Graph Sync

## Knowledge Gaps
- **447 isolated node(s):** `UseHouseholdWebSocketOptions`, `UseWakeLockResult`, `TallyCounterProps`, `Purpose`, `Scenario: Continuous duty tally mark cluster rendering` (+442 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 545 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Community 0` to `Community 32`, `Community 1`, `Community 37`, `Community 38`, `Community 9`, `Community 42`, `Community 24`, `Community 27`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `react` connect `Community 5` to `Community 3`, `Community 6`, `Community 7`, `Community 10`, `Community 43`, `Community 17`, `Community 61`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 22` to `Community 17`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `Member` (e.g. with `create_appliance()` and `get_appliance_history()`) actually correct?**
  _`Member` has 51 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `Household` (e.g. with `login()` and `activate_rotation()`) actually correct?**
  _`Household` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `ChoreAssignment` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`ChoreAssignment` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `Chore` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`Chore` has 26 INFERRED edges - model-reasoned connections that need verification._