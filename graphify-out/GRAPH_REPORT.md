# Graph Report - chores  (2026-08-27)

## Corpus Check
- 174 files · ~100,143 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1061 nodes · 1775 edges · 105 communities (88 shown, 17 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 162 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fa5094c9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- chores.py
- security.py
- /opsx-archive Command
- UpForGrabsPool.tsx
- test_websockets.py
- compilerOptions
- types/index.ts
- test_appliance_state.py
- PushSubscription
- client.ts
- Member
- Header.tsx
- devDependencies
- test_chores_crud.py
- test_member_admin.py
- dependencies
- App.tsx
- Requirements
- test_auth.py
- households.py
- pushNotifications.ts
- StationerySoundEngine
- ADDED Requirements
- Skill: openspec-new-change
- test_appliances_crud.py
- Household Coordination App — Future Features & Product Roadmap
- test_chore_swap.py
- schemas.py
- members.py
- manifest.json
- SettingsView.tsx
- compilerOptions
- Household Core Specification
- Chore Management Specification
- Requirements
- test_chore_up_for_grabs.py
- Requirement: Inertial Touch Gesture Page Turns
- Appliance Tracking Specification
- Skill: openspec-apply-change
- Onboarding.tsx
- MVP System Architecture & Design
- ADDED Requirements
- Skill: openspec-bulk-archive-change
- Skill: openspec-explore
- Skill: openspec-onboard
- Skill: openspec-verify-change
- FastAPI Backend Service
- test_migrations.py
- env.py
- Household Coordination App Documentation
- Skill: openspec-archive-change
- Skill: openspec-continue-change
- Skill: openspec-sync-specs
- test_appliance_sensor.py
- ADDED Requirements
- Requirements
- RubberStampBadge.tsx
- types
- push.py
- Notification System Specification
- /opsx-explore Command
- /opsx-sync Command
- test_health_check
- Household Coordination App — Luxury Editorial Stationery Design System
- ChoreDutyView.tsx
- Requirement: Core Appliance State Machine
- 2026-08-26-paper-notebook-design-system/design.md
- @testing-library/user-event
- @types/react
- @types/react-dom
- tsconfig.json
- @vitejs/plugin-react
- appliances.py
- Decisions
- 2026-08-27-refine-appliances-and-chores/proposal.md
- PWA 192px Icon
- PWA 512px App Icon
- App Vector SVG Icon (House with Checkmark Badge)
- Agent Instructions
- MVP Household Coordination Archive OpenSpec Metadata
- 2026-08-27-tactile-ui-revamp/design.md
- lib
- @testing-library/react
- ADDED Requirements
- vitest
- ADDED Requirements
- Requirement: Chore Definition and Configuration
- 2026-08-26-paper-notebook-design-system/tasks.md
- 2026-08-27-tactile-ui-revamp/tasks.md
- 2026-08-26-paper-notebook-design-system/proposal.md
- 2026-08-27-tactile-ui-revamp/proposal.md
- 2026-08-27-refine-appliances-and-chores/tasks.md
- date
- delete
- patch
- get
- post

## God Nodes (most connected - your core abstractions)
1. `Member` - 35 edges
2. `Household` - 24 edges
3. `PushSubscription` - 18 edges
4. `compilerOptions` - 17 edges
5. `Base` - 15 edges
6. `ChoreAssignment` - 13 edges
7. `Appliance` - 13 edges
8. `Member` - 12 edges
9. `StationerySoundEngine` - 12 edges
10. `get_or_generate_weekly_assignments()` - 12 edges

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
- **Docker Compose Self-Hosted Architecture** — docker_compose_db_service, docker_compose_backend_service, docker_compose_frontend_service [EXTRACTED 1.00]
- **OpenSpec Change Lifecycle Flow** — _agent_skills_openspec_new_change_skill_skill, _agent_skills_openspec_continue_change_skill_skill, _agent_skills_openspec_apply_change_skill_skill, _agent_skills_openspec_verify_change_skill_skill, _agent_skills_openspec_sync_specs_skill_skill, _agent_skills_openspec_archive_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Ideation to Specification Transition** — _agent_skills_openspec_explore_skill_skill, _agent_skills_openspec_explore_skill_discovery_mindset, _agent_skills_openspec_explore_skill_artifact_decision_capture, _agent_skills_openspec_new_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Verification Dimensions Framework** — _agent_skills_openspec_verify_change_skill_three_dimensional_verification, _agent_skills_openspec_verify_change_skill_issue_severity_classification, _agent_skills_openspec_verify_change_skill_graceful_degradation [EXTRACTED 1.00]
- **Appliance IoT Sensor & Push Notification Flow** — openspec_specs_appliance_tracking_spec_four_state_machine, openspec_specs_appliance_tracking_spec_sensor_webhook, openspec_specs_notification_system_spec_appliance_push_notifications, openspec_specs_notification_system_spec_websocket_broadcasting [INFERRED 0.85]
- **OpenSpec Alternative Workflows** — _opencode_commands_opsx_explore_explore_command, _opencode_commands_opsx_ff_ff_command, _opencode_commands_opsx_sync_sync_command, _opencode_commands_opsx_bulk_archive_bulk_archive_command [INFERRED 0.85]
- **OpenSpec Core Skills Suite** — _opencode_skills_openspec_new_change_skill_new_change_skill, _opencode_skills_openspec_continue_change_skill_continue_change_skill, _opencode_skills_openspec_apply_change_skill_apply_change_skill, _opencode_skills_openspec_verify_change_skill_verify_change_skill, _opencode_skills_openspec_archive_change_skill_archive_change_skill, _opencode_skills_openspec_onboard_skill_onboard_skill [INFERRED 0.95]
- **OpenSpec Standard Change Pipeline** — _opencode_commands_opsx_new_new_command, _opencode_commands_opsx_continue_continue_command, _opencode_commands_opsx_apply_apply_command, _opencode_commands_opsx_verify_verify_command, _opencode_commands_opsx_archive_archive_command [INFERRED 0.95]

## Communities (105 total, 17 thin omitted)

### Community 0 - "chores.py"
Cohesion: 0.16
Nodes (29): claim_chore_assignment(), complete_chore_assignment(), create_chore(), delete_chore(), get_chore_logs(), get_up_for_grabs_chores(), get_weekly_assignments(), list_chores() (+21 more)

### Community 1 - "security.py"
Cohesion: 0.17
Nodes (14): Settings, get_db(), AsyncSession, login(), AsyncSession, post, LoginRequest, create_access_token() (+6 more)

### Community 2 - "/opsx-archive Command"
Cohesion: 0.07
Nodes (35): /opsx-apply Command, Store Selection Mechanism, Task-Driven Implementation Flow, /opsx-archive Command, Change Archival Workflow, Pre-Archive Validation Check, Batch Change Archival Workflow, /opsx-bulk-archive Command (+27 more)

### Community 3 - "UpForGrabsPool.tsx"
Cohesion: 0.17
Nodes (11): ChoreSwapModal(), ChoreSwapModalProps, COLOR_MAP, WashiTape(), WashiTapeColor, WashiTapeProps, WashiTapeTilt, DraggableMemoNoteProps (+3 more)

### Community 4 - "test_websockets.py"
Cohesion: 0.24
Nodes (14): health_check(), get, MockWebSocket, AsyncClient, asyncio, test_ws_broadcast_appliance_state_changed(), test_ws_broadcast_chore_events(), test_ws_broadcast_member_status_changed() (+6 more)

### Community 5 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+7 more)

### Community 6 - "types/index.ts"
Cohesion: 0.24
Nodes (13): ApplianceCard(), ApplianceCardProps, getApplianceIcon(), getNextStateConfig(), NextStateConfig, ApplianceDashboard(), ApplianceDashboardProps, Appliance (+5 more)

### Community 7 - "test_appliance_state.py"
Cohesion: 0.11
Nodes (28): AsyncClient, asyncio, AsyncSession, test_appliance_forced_state_transition(), test_appliance_invalid_transition_without_force_fails(), test_appliance_sequential_state_transitions(), test_appliance_state_cross_household_returns_404(), test_appliance_state_history() (+20 more)

### Community 8 - "PushSubscription"
Cohesion: 0.21
Nodes (23): PushSubscription, create_appliance_payload(), create_chore_payload(), notify_household_appliance_clean(), notify_member_chore_assignment(), Any, AsyncSession, UUID (+15 more)

### Community 9 - "client.ts"
Cohesion: 0.23
Nodes (13): api, ApiError, getStoredToken(), request(), setStoredToken(), AuthContext, AuthContextType, AuthProvider() (+5 more)

### Community 10 - "Member"
Cohesion: 0.17
Nodes (36): Base, Appliance, ApplianceStateLog, Chore, ChoreAssignment, ChoreLog, Household, Member (+28 more)

### Community 11 - "Header.tsx"
Cohesion: 0.19
Nodes (9): Header(), HeaderProps, NavTab, NotebookTab(), NotebookTabProps, SpineOrientation, SpineType, SpiralSpine() (+1 more)

### Community 12 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/node (+9 more)

### Community 13 - "test_chores_crud.py"
Cohesion: 0.34
Nodes (14): AsyncClient, asyncio, AsyncSession, test_chore_unauthenticated_returns_401(), test_create_chore_auto_generates_weekly_assignment(), test_create_chore_continuous_duty(), test_create_chore_success(), test_create_chore_validation_effort_weight() (+6 more)

### Community 14 - "test_member_admin.py"
Cohesion: 0.40
Nodes (12): AsyncClient, asyncio, AsyncSession, test_delete_member_as_admin_success(), test_delete_member_as_member_forbidden(), test_delete_member_cross_household_returns_404(), test_delete_nonexistent_member_returns_404(), test_regenerate_invite_code_as_admin() (+4 more)

### Community 15 - "dependencies"
Cohesion: 0.06
Nodes (30): canvas-confetti, clsx, framer-motion, dependencies, canvas-confetti, clsx, framer-motion, lucide-react (+22 more)

### Community 16 - "App.tsx"
Cohesion: 0.12
Nodes (13): App(), MainApp(), queryClient, RootView(), BeforeInstallPromptEvent, PWAInstallPrompt(), PWAInstallPromptProps, useAuth() (+5 more)

### Community 17 - "Requirements"
Cohesion: 0.09
Nodes (22): Purpose, Requirement: Editorial Typographic Hierarchy and 24px Baseline Grid, Requirement: Micro-Haptic Signatures, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Velocity-Sensitive Multi-Sensory Audio, Requirement: Zero-Latency Optimistic UI Mutations, Requirements (+14 more)

### Community 18 - "test_auth.py"
Cohesion: 0.44
Nodes (10): AsyncClient, asyncio, test_get_current_member_me_authenticated(), test_get_current_member_me_invalid_token(), test_get_current_member_me_unauthenticated(), test_login_missing_pin_when_required(), test_login_with_household_id_and_correct_pin(), test_login_with_incorrect_pin() (+2 more)

### Community 19 - "households.py"
Cohesion: 0.30
Nodes (13): create_household(), join_household(), AsyncSession, Member, patch, post, regenerate_invite_code(), AuthResponse (+5 more)

### Community 20 - "pushNotifications.ts"
Cohesion: 0.60
Nodes (6): usePushNotifications(), getPushSubscription(), isPushSupported(), subscribeToPush(), unsubscribeFromPush(), urlBase64ToUint8Array()

### Community 22 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Interactive Component Presentation & Functional Integrity, Requirement: Lightweight CSS 3D Page Turn Engine, Requirement: Procedural Web Audio Sound Engine, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Typographic Hierarchy and 24px Baseline Grid, Scenario: 1-tap appliance state advancement with stamp animation (+13 more)

### Community 23 - "Skill: openspec-new-change"
Cohesion: 0.22
Nodes (9): Fast-Forward Artifact Generation, Skill: openspec-ff-change, Change Initialization & Scaffolding, OpenSpec Schema Selection, Skill: openspec-new-change, Fast-Forward Artifact Creation Procedure, Workflow: opsx-ff, New Change Creation Procedure (+1 more)

### Community 24 - "test_appliances_crud.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_appliances_unauthenticated_returns_401(), test_create_custom_appliance_default_type(), test_create_custom_appliance_success(), test_list_appliances_cross_household_isolation(), test_list_appliances_default_seeded()

### Community 25 - "Household Coordination App — Future Features & Product Roadmap"
Cohesion: 0.12
Nodes (16): 1. Executive Roadmap Vision & Philosophy, 2.1 Overview & Motivation, 2.2 Functional Architecture & State Graph Builder, 2. Feature Specification: Fully Customizable Appliance Engine, 3.1 Effort Weight Karma & Bidding Market, 3.2 Chore Check-Off with Polaroid/Receipt Photo Proof, 3.3 Grace Periods & Adaptive Away Rotations, 3. Feature Specification: Advanced Chore Economics & Ledger (+8 more)

### Community 26 - "test_chore_swap.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_swap_chore_assignments_success(), test_swap_chore_different_weeks_fails(), test_swap_chore_same_assignment_fails(), test_swap_completed_chore_fails(), test_swap_cross_household_returns_404()

### Community 27 - "schemas.py"
Cohesion: 0.19
Nodes (19): ApplianceCreate, ApplianceOut, ApplianceStateLogOut, ApplianceStateUpdate, ChoreAssignmentOut, ChoreCreate, ChoreLogCreate, ChoreLogOut (+11 more)

### Community 28 - "members.py"
Cohesion: 0.18
Nodes (16): delete_member(), get_me(), AsyncSession, delete, get, Member, patch, UUID (+8 more)

### Community 29 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 30 - "SettingsView.tsx"
Cohesion: 0.26
Nodes (6): SettingsView(), SettingsViewProps, useWakeLock(), UseWakeLockResult, Household, soundEngine

### Community 31 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 32 - "Household Core Specification"
Cohesion: 0.22
Nodes (9): Decision: Invite Code + Nickname & PIN Authentication, Household Core Delta Specification, Household Core Specification, Requirement: Household Creation, Requirement: Member Authentication and Session Management, Requirement: Member Away Status, Requirement: Household Role-Based Permissions, Requirement: Roommate Join via Invite Code (+1 more)

### Community 33 - "Chore Management Specification"
Cohesion: 0.22
Nodes (9): Decision: Weekly Duty Responsibility Shifts, Chore Management Delta Specification, Requirement: Chore Definition and Configuration, Chore Management Specification, Requirement: 1-to-1 Chore Swapping, Requirement: Hybrid Completion Tracking, Requirement: Up for Grabs Claim Pool, Requirement: Weekly Duty Assignment and Fair Rotation (+1 more)

### Community 34 - "Requirements"
Cohesion: 0.14
Nodes (13): ambient-hardware-pwa-integration Specification, Purpose, Requirement: Countertop Screen Wake Lock Kiosk Mode, Requirement: Dynamic App Icon Badging, Requirement: Interactive Push Notification Action Handlers, Requirement: Native Web Share API Export, Requirements, Scenario: Clearing app badge when no action required (+5 more)

### Community 35 - "test_chore_up_for_grabs.py"
Cohesion: 0.46
Nodes (7): AsyncClient, asyncio, AsyncSession, test_claim_completed_chore_fails(), test_up_for_grabs_cross_household_returns_404(), test_up_for_grabs_pool_and_claim_unassigned(), test_up_for_grabs_pool_includes_away_member_chores()

### Community 36 - "Requirement: Inertial Touch Gesture Page Turns"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Inertial Touch Gesture Page Turns, Requirement: Spring Physics and Shared Element Transitions, Requirement: Tension-Based Drag to Claim, Requirements, Scenario: Dragging sticky note past tear-off threshold, Scenario: Expanding appliance card into detailed slip, Scenario: Morphing chore card into swap proposal slip (+5 more)

### Community 37 - "Appliance Tracking Specification"
Cohesion: 0.25
Nodes (8): MVP Household Coordination Proposal, Appliance Tracking Delta Specification, MVP Household Coordination Implementation Tasks (TDD), OpenSpec Project Configuration, Appliance Tracking Specification, Requirement: Real-Time Elapsed Time and Activity Logging, Requirement: Preset and Custom Appliance Management, Requirement: Sensor-Ready Event Webhook

### Community 38 - "Skill: openspec-apply-change"
Cohesion: 0.33
Nodes (7): Change Selection & Prompting, Task Implementation Loop, Planning Context & Artifact Loader, Skill: openspec-apply-change, Task Progress Tracking & Checkbox Updates, Apply Task Execution Procedure, Workflow: opsx-apply

### Community 39 - "Onboarding.tsx"
Cohesion: 0.33
Nodes (5): COVER_STYLES, CoverStyle, Onboarding(), OnboardingProps, Tab

### Community 40 - "MVP System Architecture & Design"
Cohesion: 0.29
Nodes (7): Decision: Python FastAPI Backend, Decision: Multi-Household Scoped PostgreSQL Database, Decision: In-Memory WebSocket Rooms per Household, Database Schema Design (ERD), MVP System Architecture & Design, Requirement: Real-Time In-App WebSocket Broadcasting, Real-Time Live Sync & Web Push Notifications

### Community 41 - "ADDED Requirements"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Countertop Screen Wake Lock Kiosk Mode, Requirement: Dynamic App Icon Badging, Requirement: Interactive Push Notification Action Handlers, Requirement: Native Web Share API Export, Scenario: Clearing app badge when no action required, Scenario: Disabling countertop kiosk mode or tab visibility lost, Scenario: Emptying appliance directly from OS notification (+3 more)

### Community 42 - "Skill: openspec-bulk-archive-change"
Cohesion: 0.40
Nodes (6): Batch Conflict Analysis & Ordering, Candidate Change Discovery & Filtering, Sequential Batch Archival Execution, Skill: openspec-bulk-archive-change, Bulk Archival Procedure, Workflow: opsx-bulk-archive

### Community 43 - "Skill: openspec-explore"
Cohesion: 0.33
Nodes (6): Artifact Decision Capture Mapping, Discovery Mindset & Exploratory Reasoning, Skill: openspec-explore, Visual Architecture & Flow Diagramming, Explore Dialogue Procedure, Workflow: opsx-explore

### Community 44 - "Skill: openspec-onboard"
Cohesion: 0.33
Nodes (6): OpenSpec CLI Command Reference, Delta Spec Concepts & Formatting, Guided Onboarding Lifecycle Walkthrough, Skill: openspec-onboard, Interactive Onboarding Tutorial Procedure, Workflow: opsx-onboard

### Community 45 - "Skill: openspec-verify-change"
Cohesion: 0.33
Nodes (6): Graceful Degradation & Verification Heuristics, Issue Severity Classification (Critical/Warning/Suggestion), Skill: openspec-verify-change, Three-Dimensional Verification Framework, Implementation Verification Procedure, Workflow: opsx-verify

### Community 46 - "FastAPI Backend Service"
Cohesion: 0.47
Nodes (6): Backend Python Dependencies, FastAPI Backend Service, PostgreSQL Database Service, Frontend Nginx Service, Docker Compose Stack, Frontend HTML Entrypoint

### Community 47 - "test_migrations.py"
Cohesion: 0.33
Nodes (4): alembic_config(), asyncio, fixture, test_async_migration_upgrade_and_downgrade()

### Community 48 - "env.py"
Cohesion: 0.27
Nodes (10): do_run_migrations(), Run migrations in 'offline' mode., Run migrations in 'online' mode using async engine., Run migrations in 'online' mode using sync engine., Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online() (+2 more)

### Community 49 - "Household Coordination App Documentation"
Cohesion: 0.33
Nodes (6): Requirement: 4-State Core Appliance State Machine, REST API & WebSocket Endpoint Reference, Docker Compose 1-Step Self-Hosting, 4-State Shared Appliance Tracking, Household Coordination App Documentation, Progressive Web Application (PWA) Client

### Community 50 - "Skill: openspec-archive-change"
Cohesion: 0.50
Nodes (5): Change Archival Sequence, Pre-Archive Verification Guard, Skill: openspec-archive-change, Archive Change Procedure, Workflow: opsx-archive

### Community 51 - "Skill: openspec-continue-change"
Cohesion: 0.50
Nodes (5): Artifact Schema Validation, Schema Progression & Next Artifact Resolution, Skill: openspec-continue-change, Continue Next Artifact Procedure, Workflow: opsx-continue

### Community 52 - "Skill: openspec-sync-specs"
Cohesion: 0.40
Nodes (5): Delta Specs Format (Added/Modified/Removed), Intelligent Delta Spec Merging, Skill: openspec-sync-specs, Sync Specs to Main Procedure, Workflow: opsx-sync

### Community 53 - "test_appliance_sensor.py"
Cohesion: 0.49
Nodes (9): AsyncClient, asyncio, AsyncSession, test_sensor_event_appliance_not_found_returns_404(), test_sensor_event_completes_cycle_from_running(), test_sensor_event_ignored_when_no_threshold_met(), test_sensor_event_starts_cycle_from_dirty(), test_sensor_event_starts_cycle_from_empty() (+1 more)

### Community 54 - "ADDED Requirements"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Inertial Touch Gesture Page Turns, Requirement: Spring Physics and Shared Element Transitions, Requirement: Tension-Based Drag to Claim, Scenario: Dragging sticky note past tear-off threshold, Scenario: Expanding appliance card into detailed slip, Scenario: Morphing chore card into swap proposal slip, Scenario: Releasing drag below threshold (+3 more)

### Community 55 - "Requirements"
Cohesion: 0.17
Nodes (11): generative-stationery-rendering Specification, Purpose, Requirement: Micro-Particle Paper Fleck Bursts, Requirement: Organic Continuous Duty Tally Mark Clusters, Requirement: Procedural Hand-Drawn Inking, Requirements, Scenario: Animating pencil scribble strikethrough, Scenario: Rendering diagonal crossbar on fifth tally (+3 more)

### Community 56 - "RubberStampBadge.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_LABELS, DEFAULT_ROTATIONS, RubberStampBadge(), RubberStampBadgeProps, StampStatus

### Community 57 - "types"
Cohesion: 0.40
Nodes (4): @testing-library/jest-dom, types, vitest/globals, @testing-library/jest-dom

### Community 58 - "push.py"
Cohesion: 0.27
Nodes (9): get_vapid_public_key(), AsyncSession, delete, get, Member, post, subscribe(), unsubscribe() (+1 more)

### Community 59 - "Notification System Specification"
Cohesion: 0.40
Nodes (5): Notification System Delta Specification, Requirement: Appliance State Push Notifications, Requirement: Weekly Chore Assignment Notifications, Notification System Specification, Requirement: Web Push Subscription Management

### Community 60 - "/opsx-explore Command"
Cohesion: 0.50
Nodes (4): Exploratory Thinking & Ideation Mode, /opsx-explore Command, openspec-explore Skill, Thinking Partner Protocol

### Community 61 - "/opsx-sync Command"
Cohesion: 0.50
Nodes (4): Delta Spec Synchronization, /opsx-sync Command, Delta Sync Protocol, openspec-sync-specs Skill

### Community 62 - "test_health_check"
Cohesion: 0.50
Nodes (3): AsyncClient, asyncio, test_health_check()

### Community 63 - "Household Coordination App — Luxury Editorial Stationery Design System"
Cohesion: 0.05
Nodes (37): 1.1 The Physical Notebook Metaphor, 1.2 Materiality, Paper Textures & Physics, 1.3 Lighting, Elevation & Natural Imperfection, 1. Desktop Two-Page Spread ($\ge 1024\text{px}$), 1. Executive Design Vision & Visual Thesis, 2.1 Daytime Paper Palette (Light Mode), 2.2 Pastel Highlighter Palette (Multiply Blend Overlays), 2.3 Night Journal Palette (Dark Mode) (+29 more)

### Community 64 - "ChoreDutyView.tsx"
Cohesion: 0.10
Nodes (20): ChoreDutyView(), ChoreDutyViewProps, ChoreLogModal(), ChoreLogModalProps, CreateChoreModal(), CreateChoreModalProps, PaperCard, PaperCardProps (+12 more)

### Community 65 - "Requirement: Core Appliance State Machine"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Core Appliance State Machine, Requirement: Preset and Custom Appliance Management, Scenario: Adding a preset appliance, Scenario: Advancing dishwasher through streamlined cycle, Scenario: Advancing washer or dryer through cycle with ready stamp, Scenario: Creating a household with default appliance presets, Scenario: Disallowing custom appliance type creation in standard UI (+1 more)

### Community 67 - "2026-08-26-paper-notebook-design-system/design.md"
Cohesion: 0.20
Nodes (9): Context, Decision 1: Pure CSS 3D Transforms over Three.js / WebGL, Decision 2: Procedural Web Audio API over Audio Asset Bundling, Decision 3: Modular Stationery Component Primitives (`frontend/src/components/stationery/`), Decision 4: CSS Variable Token Bridge with Tailwind Config Extension, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 71 - "tsconfig.json"
Cohesion: 0.50
Nodes (3): include, references, src

### Community 75 - "appliances.py"
Cohesion: 0.15
Nodes (19): ApplianceCreate, ApplianceStateUpdate, create_appliance(), get_appliance_history(), ingest_sensor_event(), list_appliances(), AsyncSession, get (+11 more)

### Community 76 - "Decisions"
Cohesion: 0.22
Nodes (8): Context, Decision 1: Restrict Appliance Creation in Frontend vs. Backend Schema, Decision 2: Dishwasher State Machine Streamlining, Decision 3: Washer & Dryer Stamp Clarity, Decision 4: Chore Creation UI & Current Week Assignment Seeding, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 77 - "2026-08-27-refine-appliances-and-chores/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 88 - "2026-08-27-tactile-ui-revamp/design.md"
Cohesion: 0.20
Nodes (9): 1. Framer Motion for Spring Physics and Layout Morphing, 2. Rough.js for Procedural Hand-Drawn Inking & Tally Marks, 3. Procedural Multi-Sensory Audio & Micro-Haptics, 4. Progressive Enhancement for Hardware & PWA APIs, Context, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 89 - "lib"
Cohesion: 0.50
Nodes (4): lib, DOM, DOM.Iterable, ES2022

### Community 91 - "ADDED Requirements"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Micro-Particle Paper Fleck Bursts, Requirement: Organic Continuous Duty Tally Mark Clusters, Requirement: Procedural Hand-Drawn Inking, Scenario: Animating pencil scribble strikethrough, Scenario: Rendering diagonal crossbar on fifth tally, Scenario: Rendering organic hand-drawn checkboxes, Scenario: Rendering tally mark vertical strokes (+1 more)

### Community 93 - "ADDED Requirements"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Micro-Haptic Signatures, Requirement: Velocity-Sensitive Multi-Sensory Audio, Requirement: Zero-Latency Optimistic UI Mutations, Scenario: Heavy action resonance modulation, Scenario: Optimistic appliance state advancement, Scenario: Pencil checkbox toggle haptic tick, Scenario: Rapid sequential checkoff sound variation (+1 more)

### Community 94 - "Requirement: Chore Definition and Configuration"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Chore Definition and Configuration, Scenario: Creating a new chore from UI, Scenario: Immediate assignment generation on chore creation

### Community 95 - "2026-08-26-paper-notebook-design-system/tasks.md"
Cohesion: 0.22
Nodes (8): 1. Foundation & Asset Setup, 2. Stationery Component Primitives, 3. Procedural Sound Engine & CSS 3D Navigation, 4. Appliance Dashboard Refactoring, 5. Chore Duty View & Ruled Paper Refactoring, 6. Up-For-Grabs Memo Board & Paperclipped Modals, 7. Onboarding Cover & Settings Refactoring, 8. Verification & Visual Audit

### Community 96 - "2026-08-27-tactile-ui-revamp/tasks.md"
Cohesion: 0.25
Nodes (7): 1. Dependencies and Foundation Setup, 2. Spring Physics and Layout Animations, 3. Generative Inking, Checkboxes and Tally Clusters, 4. Gesture Physics and Swipe Navigation, 5. Multi-Sensory Audio and Micro-Haptics, 6. Ambient Hardware and PWA Integrations, 7. Verification and Testing

### Community 97 - "2026-08-26-paper-notebook-design-system/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 98 - "2026-08-27-tactile-ui-revamp/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 99 - "2026-08-27-refine-appliances-and-chores/tasks.md"
Cohesion: 0.40
Nodes (4): 1. Backend Transition & Chore Assignment Adjustments, 2. Appliance UI & Rubber Stamp Improvements, 3. Chore Creation UI Implementation, 4. End-to-End Verification & Graph Update

## Knowledge Gaps
- **357 isolated node(s):** `1. Executive Roadmap Vision & Philosophy`, `2.1 Overview & Motivation`, `Key Capabilities:`, `3.1 Effort Weight Karma & Bidding Market`, `3.2 Chore Check-Off with Polaroid/Receipt Photo Proof` (+352 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Member` to `chores.py`, `security.py`, `test_member_admin.py`, `households.py`, `push.py`, `members.py`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@testing-library/user-event`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `dependencies`, `types`, `@testing-library/react`, `vitest`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Appliance` connect `Member` to `households.py`, `test_appliances_crud.py`, `appliances.py`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Member` (e.g. with `login()` and `create_household()`) actually correct?**
  _`Member` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Household` (e.g. with `login()` and `create_household()`) actually correct?**
  _`Household` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `PushSubscription` (e.g. with `subscribe()` and `unsubscribe()`) actually correct?**
  _`PushSubscription` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `1. Executive Roadmap Vision & Philosophy`, `2.1 Overview & Motivation`, `Key Capabilities:` to the rest of the system?**
  _357 weakly-connected nodes found - possible documentation gaps or missing edges._