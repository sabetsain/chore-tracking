# Graph Report - chores  (2026-08-27)

## Corpus Check
- 150 files · ~88,447 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 841 nodes · 1610 edges · 85 communities (70 shown, 15 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 197 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ea86162`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- security.py
- Member
- /opsx-archive Command
- ChoreDutyView.tsx
- test_websockets.py
- compilerOptions
- types/index.ts
- appliances.py
- test_push_notifications.py
- client.ts
- ADDED Requirements
- Header.tsx
- devDependencies
- test_chores_crud.py
- test_member_admin.py
- dependencies
- App.tsx
- members.py
- test_auth.py
- test_households.py
- pushNotifications.ts
- StationerySoundEngine
- design.md
- Skill: openspec-new-change
- test_appliances_crud.py
- test_chore_rotation.py
- test_chore_swap.py
- households.py
- schemas.py
- manifest.json
- useHouseholdWebSocket.ts
- compilerOptions
- Household Core Specification
- Chore Management Specification
- tasks.md
- test_chore_up_for_grabs.py
- push.py
- Appliance Tracking Specification
- Skill: openspec-apply-change
- PaperCard.tsx
- MVP System Architecture & Design
- proposal.md
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
- SettingsView.tsx
- autoprefixer
- package.json
- scripts
- PWAInstallPrompt.tsx
- Notification System Specification
- /opsx-explore Command
- /opsx-sync Command
- test_health_check
- Household Coordination App — Paper Notebook Design System
- @testing-library/user-event
- @types/react
- @types/react-dom
- vite
- @vitejs/plugin-react
- get
- post
- UUID
- PWA 192px Icon
- PWA 512px App Icon
- App Vector SVG Icon (House with Checkmark Badge)
- Agent Instructions
- MVP Household Coordination Archive OpenSpec Metadata

## God Nodes (most connected - your core abstractions)
1. `Member` - 49 edges
2. `Household` - 25 edges
3. `ChoreAssignment` - 25 edges
4. `Chore` - 23 edges
5. `PushSubscription` - 19 edges
6. `compilerOptions` - 17 edges
7. `Base` - 15 edges
8. `Appliance` - 14 edges
9. `Member` - 12 edges
10. `create_household()` - 12 edges

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

## Communities (85 total, 15 thin omitted)

### Community 0 - "security.py"
Cohesion: 0.17
Nodes (14): Settings, get_db(), AsyncSession, login(), AsyncSession, post, LoginRequest, create_access_token() (+6 more)

### Community 1 - "Member"
Cohesion: 0.10
Nodes (63): Base, Appliance, ApplianceStateLog, Chore, ChoreAssignment, ChoreLog, Household, Member (+55 more)

### Community 2 - "/opsx-archive Command"
Cohesion: 0.07
Nodes (35): /opsx-apply Command, Store Selection Mechanism, Task-Driven Implementation Flow, /opsx-archive Command, Change Archival Workflow, Pre-Archive Validation Check, Batch Change Archival Workflow, /opsx-bulk-archive Command (+27 more)

### Community 3 - "ChoreDutyView.tsx"
Cohesion: 0.11
Nodes (16): ChoreDutyView(), ChoreDutyViewProps, DEFAULT_LABELS, DEFAULT_ROTATIONS, RubberStampBadge(), RubberStampBadgeProps, StampStatus, ScribbleCheckbox() (+8 more)

### Community 4 - "test_websockets.py"
Cohesion: 0.14
Nodes (20): health_check(), get, decode_access_token(), ConnectionManager, Any, UUID, websocket_endpoint(), MockWebSocket (+12 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): @testing-library/jest-dom, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution (+18 more)

### Community 6 - "types/index.ts"
Cohesion: 0.21
Nodes (14): ApplianceCard(), ApplianceCardProps, getApplianceIcon(), getNextStateConfig(), NextStateConfig, ApplianceDashboard(), ApplianceDashboardProps, Appliance (+6 more)

### Community 7 - "appliances.py"
Cohesion: 0.17
Nodes (23): ApplianceCreate, ApplianceStateUpdate, create_appliance(), get_appliance_history(), ingest_sensor_event(), list_appliances(), AsyncSession, Member (+15 more)

### Community 8 - "test_push_notifications.py"
Cohesion: 0.20
Nodes (22): create_appliance_payload(), create_chore_payload(), notify_household_appliance_clean(), notify_member_chore_assignment(), Any, AsyncSession, UUID, send_push_notification() (+14 more)

### Community 9 - "client.ts"
Cohesion: 0.22
Nodes (14): api, ApiError, getStoredToken(), request(), setStoredToken(), AuthContext, AuthContextType, AuthProvider() (+6 more)

### Community 10 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Interactive Component Presentation & Functional Integrity, Requirement: Lightweight CSS 3D Page Turn Engine, Requirement: Procedural Web Audio Sound Engine, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Typographic Hierarchy and 24px Baseline Grid, Scenario: 1-tap appliance state advancement with stamp animation (+13 more)

### Community 11 - "Header.tsx"
Cohesion: 0.19
Nodes (9): Header(), HeaderProps, NavTab, NotebookTab(), NotebookTabProps, SpineOrientation, SpineType, SpiralSpine() (+1 more)

### Community 12 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, jsdom, postcss, tailwindcss, @testing-library/react, @types/node, typescript, vitest (+7 more)

### Community 13 - "test_chores_crud.py"
Cohesion: 0.36
Nodes (13): AsyncClient, asyncio, AsyncSession, test_chore_unauthenticated_returns_401(), test_create_chore_continuous_duty(), test_create_chore_success(), test_create_chore_validation_effort_weight(), test_create_chore_validation_invalid_completion_type() (+5 more)

### Community 14 - "test_member_admin.py"
Cohesion: 0.40
Nodes (12): AsyncClient, asyncio, AsyncSession, test_delete_member_as_admin_success(), test_delete_member_as_member_forbidden(), test_delete_member_cross_household_returns_404(), test_delete_nonexistent_member_returns_404(), test_regenerate_invite_code_as_admin() (+4 more)

### Community 15 - "dependencies"
Cohesion: 0.15
Nodes (13): clsx, dependencies, clsx, lucide-react, react, react-dom, tailwind-merge, @tanstack/react-query (+5 more)

### Community 16 - "App.tsx"
Cohesion: 0.21
Nodes (9): App(), queryClient, TAB_ORDER, ChoreSwapModal(), ChoreSwapModalProps, UpForGrabsPool(), UpForGrabsPoolProps, ChoreAssignment (+1 more)

### Community 17 - "members.py"
Cohesion: 0.17
Nodes (17): delete_member(), get_me(), AsyncSession, delete, get, Member, patch, UUID (+9 more)

### Community 18 - "test_auth.py"
Cohesion: 0.44
Nodes (10): AsyncClient, asyncio, test_get_current_member_me_authenticated(), test_get_current_member_me_invalid_token(), test_get_current_member_me_unauthenticated(), test_login_missing_pin_when_required(), test_login_with_household_id_and_correct_pin(), test_login_with_incorrect_pin() (+2 more)

### Community 19 - "test_households.py"
Cohesion: 0.47
Nodes (9): AsyncClient, asyncio, AsyncSession, test_create_household_invalid_pin(), test_create_household_success(), test_create_household_without_pin(), test_join_household_duplicate_nickname(), test_join_household_invalid_invite_code() (+1 more)

### Community 20 - "pushNotifications.ts"
Cohesion: 0.60
Nodes (6): usePushNotifications(), getPushSubscription(), isPushSupported(), subscribeToPush(), unsubscribeFromPush(), urlBase64ToUint8Array()

### Community 22 - "design.md"
Cohesion: 0.20
Nodes (9): Context, Decision 1: Pure CSS 3D Transforms over Three.js / WebGL, Decision 2: Procedural Web Audio API over Audio Asset Bundling, Decision 3: Modular Stationery Component Primitives (`frontend/src/components/stationery/`), Decision 4: CSS Variable Token Bridge with Tailwind Config Extension, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 23 - "Skill: openspec-new-change"
Cohesion: 0.22
Nodes (9): Fast-Forward Artifact Generation, Skill: openspec-ff-change, Change Initialization & Scaffolding, OpenSpec Schema Selection, Skill: openspec-new-change, Fast-Forward Artifact Creation Procedure, Workflow: opsx-ff, New Change Creation Procedure (+1 more)

### Community 24 - "test_appliances_crud.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_appliances_unauthenticated_returns_401(), test_create_custom_appliance_default_type(), test_create_custom_appliance_success(), test_list_appliances_cross_household_isolation(), test_list_appliances_default_seeded()

### Community 25 - "test_chore_rotation.py"
Cohesion: 0.47
Nodes (8): AsyncClient, asyncio, AsyncSession, test_get_assignments_default_current_week(), test_weekly_rotation_all_away_sets_member_none(), test_weekly_rotation_idempotent(), test_weekly_rotation_round_robin(), test_weekly_rotation_skips_away_member()

### Community 26 - "test_chore_swap.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_swap_chore_assignments_success(), test_swap_chore_different_weeks_fails(), test_swap_chore_same_assignment_fails(), test_swap_completed_chore_fails(), test_swap_cross_household_returns_404()

### Community 27 - "households.py"
Cohesion: 0.30
Nodes (13): create_household(), join_household(), AsyncSession, Member, patch, post, regenerate_invite_code(), AuthResponse (+5 more)

### Community 28 - "schemas.py"
Cohesion: 0.26
Nodes (13): ApplianceCreate, ApplianceOut, ApplianceStateLogOut, ApplianceStateUpdate, ChoreCreate, ChoreLogCreate, ChoreLogOut, ChoreSwapRequest (+5 more)

### Community 29 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 30 - "useHouseholdWebSocket.ts"
Cohesion: 0.25
Nodes (4): MockWebSocket, useHouseholdWebSocket(), UseHouseholdWebSocketOptions, WebSocketEvent

### Community 31 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 32 - "Household Core Specification"
Cohesion: 0.22
Nodes (9): Decision: Invite Code + Nickname & PIN Authentication, Household Core Delta Specification, Household Core Specification, Requirement: Household Creation, Requirement: Member Authentication and Session Management, Requirement: Member Away Status, Requirement: Household Role-Based Permissions, Requirement: Roommate Join via Invite Code (+1 more)

### Community 33 - "Chore Management Specification"
Cohesion: 0.22
Nodes (9): Decision: Weekly Duty Responsibility Shifts, Chore Management Delta Specification, Requirement: Chore Definition and Configuration, Chore Management Specification, Requirement: 1-to-1 Chore Swapping, Requirement: Hybrid Completion Tracking, Requirement: Up for Grabs Claim Pool, Requirement: Weekly Duty Assignment and Fair Rotation (+1 more)

### Community 34 - "tasks.md"
Cohesion: 0.22
Nodes (8): 1. Foundation & Asset Setup, 2. Stationery Component Primitives, 3. Procedural Sound Engine & CSS 3D Navigation, 4. Appliance Dashboard Refactoring, 5. Chore Duty View & Ruled Paper Refactoring, 6. Up-For-Grabs Memo Board & Paperclipped Modals, 7. Onboarding Cover & Settings Refactoring, 8. Verification & Visual Audit

### Community 35 - "test_chore_up_for_grabs.py"
Cohesion: 0.46
Nodes (7): AsyncClient, asyncio, AsyncSession, test_claim_completed_chore_fails(), test_up_for_grabs_cross_household_returns_404(), test_up_for_grabs_pool_and_claim_unassigned(), test_up_for_grabs_pool_includes_away_member_chores()

### Community 36 - "push.py"
Cohesion: 0.22
Nodes (12): get_vapid_public_key(), AsyncSession, delete, get, Member, post, subscribe(), unsubscribe() (+4 more)

### Community 37 - "Appliance Tracking Specification"
Cohesion: 0.25
Nodes (8): MVP Household Coordination Proposal, Appliance Tracking Delta Specification, MVP Household Coordination Implementation Tasks (TDD), OpenSpec Project Configuration, Appliance Tracking Specification, Requirement: Real-Time Elapsed Time and Activity Logging, Requirement: Preset and Custom Appliance Management, Requirement: Sensor-Ready Event Webhook

### Community 38 - "Skill: openspec-apply-change"
Cohesion: 0.33
Nodes (7): Change Selection & Prompting, Task Implementation Loop, Planning Context & Artifact Loader, Skill: openspec-apply-change, Task Progress Tracking & Checkbox Updates, Apply Task Execution Procedure, Workflow: opsx-apply

### Community 39 - "PaperCard.tsx"
Cohesion: 0.14
Nodes (14): ChoreLogModal(), ChoreLogModalProps, COVER_STYLES, CoverStyle, Onboarding(), OnboardingProps, Tab, PaperCard (+6 more)

### Community 40 - "MVP System Architecture & Design"
Cohesion: 0.29
Nodes (7): Decision: Python FastAPI Backend, Decision: Multi-Household Scoped PostgreSQL Database, Decision: In-Memory WebSocket Rooms per Household, Database Schema Design (ERD), MVP System Architecture & Design, Requirement: Real-Time In-App WebSocket Broadcasting, Real-Time Live Sync & Web Push Notifications

### Community 41 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

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

### Community 54 - "SettingsView.tsx"
Cohesion: 0.60
Nodes (3): SettingsView(), SettingsViewProps, Household

### Community 56 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 57 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 58 - "PWAInstallPrompt.tsx"
Cohesion: 0.50
Nodes (3): BeforeInstallPromptEvent, PWAInstallPrompt(), PWAInstallPromptProps

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

### Community 63 - "Household Coordination App — Paper Notebook Design System"
Cohesion: 0.05
Nodes (37): 1.1 The Physical Notebook Metaphor, 1.2 Materiality, Paper Textures & Physics, 1.3 Lighting, Elevation & Natural Imperfection, 1. Desktop Two-Page Spread ($\ge 1024\text{px}$), 1. Executive Design Vision & Visual Thesis, 2.1 Daytime Paper Palette (Light Mode), 2.2 Pastel Highlighter Palette (Multiply Blend Overlays), 2.3 Night Journal Palette (Dark Mode) (+29 more)

## Knowledge Gaps
- **238 isolated node(s):** `1.1 The Physical Notebook Metaphor`, `1.2 Materiality, Paper Textures & Physics`, `1.3 Lighting, Elevation & Natural Imperfection`, `2.1 Daytime Paper Palette (Light Mode)`, `2.2 Pastel Highlighter Palette (Multiply Blend Overlays)` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Member` to `security.py`, `push.py`, `test_member_admin.py`, `members.py`, `test_households.py`, `households.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `ChoreAssignment` connect `Member` to `test_chore_rotation.py`, `test_chore_swap.py`, `test_chore_up_for_grabs.py`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `PushSubscription` connect `Member` to `test_push_notifications.py`, `push.py`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `Member` (e.g. with `login()` and `claim_chore_assignment()`) actually correct?**
  _`Member` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Household` (e.g. with `login()` and `create_household()`) actually correct?**
  _`Household` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `ChoreAssignment` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`ChoreAssignment` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Chore` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`Chore` has 17 INFERRED edges - model-reasoned connections that need verification._