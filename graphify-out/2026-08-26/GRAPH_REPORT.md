# Graph Report - chores  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 856 nodes · 1604 edges · 83 communities (68 shown, 15 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 197 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5462ba59`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- Member
- chores.py
- Onboarding.tsx
- test_push_notifications.py
- /opsx-archive Command
- test_websockets.py
- compilerOptions
- ADDED Requirements
- devDependencies
- test_chores_crud.py
- test_member_admin.py
- dependencies
- test_appliance_state.py
- test_auth.py
- StationerySoundEngine
- test_appliance_sensor.py
- test_households.py
- pushNotifications.ts
- design.md
- Skill: openspec-new-change
- test_appliances_crud.py
- test_chore_rotation.py
- test_chore_swap.py
- test_full_roommate_lifecycle_simulation
- 9. Implementation Roadmap & Component Migration Guide
- manifest.json
- compilerOptions
- Household Core Specification
- tasks.md
- test_chore_up_for_grabs.py
- 5. Tactile Stationery Kit & Component Guidelines
- Notification System Specification
- Skill: openspec-apply-change
- test_chore_completion.py
- MVP System Architecture & Design
- Household Coordination App Documentation
- Appliance Tracking Specification
- proposal.md
- Skill: openspec-bulk-archive-change
- Skill: openspec-explore
- Skill: openspec-onboard
- Skill: openspec-verify-change
- FastAPI Backend Service
- test_migrations.py
- Household Coordination App — Paper Notebook Design System
- Chore Management Specification
- Skill: openspec-archive-change
- Skill: openspec-continue-change
- Skill: openspec-sync-specs
- 7.1 Breakpoint Specifications
- 2. Color Tokens & Surface Hierarchy
- 3. Typography System & Font Pairing
- package.json
- scripts
- /opsx-explore Command
- /opsx-sync Command
- test_health_check
- 1. Executive Design Vision & Visual Thesis
- 4. Motion, Physics & Page-Flip Engine
- 8. Accessibility (a11y) & Standards Compliance
- @testing-library/react
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
9. `Member` - 13 edges
10. `create_household()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Zero-Friction Roommate Onboarding & Auth` --semantically_similar_to--> `Requirement: Roommate Join via Invite Code`  [INFERRED] [semantically similar]
  README.md → openspec/specs/household-core/spec.md
- `Real-Time Live Sync & Web Push Notifications` --semantically_similar_to--> `Requirement: Real-Time In-App WebSocket Broadcasting`  [INFERRED] [semantically similar]
  README.md → openspec/specs/notification-system/spec.md
- `Intelligent Chore Rotation & Tracking` --semantically_similar_to--> `Requirement: Weekly Duty Assignment and Fair Rotation`  [INFERRED] [semantically similar]
  README.md → openspec/specs/chore-management/spec.md
- `4-State Shared Appliance Tracking` --semantically_similar_to--> `Requirement: 4-State Core Appliance State Machine`  [INFERRED] [semantically similar]
  README.md → openspec/specs/appliance-tracking/spec.md
- `Skill: openspec-ff-change` --semantically_similar_to--> `Skill: openspec-continue-change`  [INFERRED] [semantically similar]
  .agent/skills/openspec-ff-change/SKILL.md → .agent/skills/openspec-continue-change/SKILL.md

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

## Communities (83 total, 15 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (58): api, ApiError, getStoredToken(), request(), setStoredToken(), App(), MainApp(), queryClient (+50 more)

### Community 1 - "Member"
Cohesion: 0.07
Nodes (73): do_run_migrations(), Run migrations in 'offline' mode., Run migrations in 'online' mode using async engine., Run migrations in 'online' mode using sync engine., Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online() (+65 more)

### Community 2 - "chores.py"
Cohesion: 0.10
Nodes (55): Chore, ChoreAssignment, claim_chore_assignment(), complete_chore_assignment(), create_chore(), delete_chore(), get_chore_logs(), get_up_for_grabs_chores() (+47 more)

### Community 3 - "Onboarding.tsx"
Cohesion: 0.06
Nodes (32): COVER_STYLES, CoverStyle, Onboarding(), OnboardingProps, Tab, NotebookTab(), NotebookTabProps, PaperCard (+24 more)

### Community 4 - "test_push_notifications.py"
Cohesion: 0.12
Nodes (35): ApplianceCreate, ApplianceStateUpdate, create_appliance(), get_appliance_history(), ingest_sensor_event(), list_appliances(), AsyncSession, Member (+27 more)

### Community 5 - "/opsx-archive Command"
Cohesion: 0.07
Nodes (35): /opsx-apply Command, Store Selection Mechanism, Task-Driven Implementation Flow, /opsx-archive Command, Change Archival Workflow, Pre-Archive Validation Check, Batch Change Archival Workflow, /opsx-bulk-archive Command (+27 more)

### Community 6 - "test_websockets.py"
Cohesion: 0.14
Nodes (20): health_check(), get, decode_access_token(), ConnectionManager, Any, UUID, websocket_endpoint(), MockWebSocket (+12 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): @testing-library/jest-dom, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution (+18 more)

### Community 8 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Interactive Component Presentation & Functional Integrity, Requirement: Lightweight CSS 3D Page Turn Engine, Requirement: Procedural Web Audio Sound Engine, Requirement: Reusable Stationery Primitives, Requirement: Stationery Color Palette and Theme Tokens, Requirement: Typographic Hierarchy and 24px Baseline Grid, Scenario: 1-tap appliance state advancement with stamp animation (+13 more)

### Community 9 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/node, typescript (+7 more)

### Community 10 - "test_chores_crud.py"
Cohesion: 0.36
Nodes (13): AsyncClient, asyncio, AsyncSession, test_chore_unauthenticated_returns_401(), test_create_chore_continuous_duty(), test_create_chore_success(), test_create_chore_validation_effort_weight(), test_create_chore_validation_invalid_completion_type() (+5 more)

### Community 11 - "test_member_admin.py"
Cohesion: 0.35
Nodes (13): AsyncClient, asyncio, AsyncSession, test_delete_member_as_admin_success(), test_delete_member_as_member_forbidden(), test_delete_member_cross_household_returns_404(), test_delete_nonexistent_member_returns_404(), test_regenerate_invite_code_as_admin() (+5 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): clsx, dependencies, clsx, lucide-react, react, react-dom, tailwind-merge, @tanstack/react-query (+5 more)

### Community 13 - "test_appliance_state.py"
Cohesion: 0.42
Nodes (10): AsyncClient, asyncio, AsyncSession, test_appliance_forced_state_transition(), test_appliance_invalid_transition_without_force_fails(), test_appliance_sequential_state_transitions(), test_appliance_state_cross_household_returns_404(), test_appliance_state_history() (+2 more)

### Community 14 - "test_auth.py"
Cohesion: 0.44
Nodes (10): AsyncClient, asyncio, test_get_current_member_me_authenticated(), test_get_current_member_me_invalid_token(), test_get_current_member_me_unauthenticated(), test_login_missing_pin_when_required(), test_login_with_household_id_and_correct_pin(), test_login_with_incorrect_pin() (+2 more)

### Community 16 - "test_appliance_sensor.py"
Cohesion: 0.49
Nodes (9): AsyncClient, asyncio, AsyncSession, test_sensor_event_appliance_not_found_returns_404(), test_sensor_event_completes_cycle_from_running(), test_sensor_event_ignored_when_no_threshold_met(), test_sensor_event_starts_cycle_from_dirty(), test_sensor_event_starts_cycle_from_empty() (+1 more)

### Community 17 - "test_households.py"
Cohesion: 0.47
Nodes (9): AsyncClient, asyncio, AsyncSession, test_create_household_invalid_pin(), test_create_household_success(), test_create_household_without_pin(), test_join_household_duplicate_nickname(), test_join_household_invalid_invite_code() (+1 more)

### Community 18 - "pushNotifications.ts"
Cohesion: 0.60
Nodes (6): usePushNotifications(), getPushSubscription(), isPushSupported(), subscribeToPush(), unsubscribeFromPush(), urlBase64ToUint8Array()

### Community 19 - "design.md"
Cohesion: 0.20
Nodes (9): Context, Decision 1: Pure CSS 3D Transforms over Three.js / WebGL, Decision 2: Procedural Web Audio API over Audio Asset Bundling, Decision 3: Modular Stationery Component Primitives (`frontend/src/components/stationery/`), Decision 4: CSS Variable Token Bridge with Tailwind Config Extension, Decisions, Goals / Non-Goals, Migration Plan (+1 more)

### Community 20 - "Skill: openspec-new-change"
Cohesion: 0.22
Nodes (9): Fast-Forward Artifact Generation, Skill: openspec-ff-change, Change Initialization & Scaffolding, OpenSpec Schema Selection, Skill: openspec-new-change, Fast-Forward Artifact Creation Procedure, Workflow: opsx-ff, New Change Creation Procedure (+1 more)

### Community 21 - "test_appliances_crud.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_appliances_unauthenticated_returns_401(), test_create_custom_appliance_default_type(), test_create_custom_appliance_success(), test_list_appliances_cross_household_isolation(), test_list_appliances_default_seeded()

### Community 22 - "test_chore_rotation.py"
Cohesion: 0.47
Nodes (8): AsyncClient, asyncio, AsyncSession, test_get_assignments_default_current_week(), test_weekly_rotation_all_away_sets_member_none(), test_weekly_rotation_idempotent(), test_weekly_rotation_round_robin(), test_weekly_rotation_skips_away_member()

### Community 23 - "test_chore_swap.py"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_swap_chore_assignments_success(), test_swap_chore_different_weeks_fails(), test_swap_chore_same_assignment_fails(), test_swap_completed_chore_fails(), test_swap_cross_household_returns_404()

### Community 24 - "test_full_roommate_lifecycle_simulation"
Cohesion: 0.22
Nodes (7): MockWebSocket, AsyncClient, asyncio, AsyncSession, Mock WebSocket to capture broadcasts during multi-client simulation., Comprehensive End-to-End Simulation of a 3-Roommate Household: 1. Roommate 1…, test_full_roommate_lifecycle_simulation()

### Community 25 - "9. Implementation Roadmap & Component Migration Guide"
Cohesion: 0.22
Nodes (9): 9. Implementation Roadmap & Component Migration Guide, Phase 1: Foundation & Asset Setup, Phase 2: Stationery Primitives (`frontend/src/components/stationery/`), Phase 3: Header & Page-Flip Integration, Phase 4: Appliance Dashboard Refactoring, Phase 5: Chore Duty View & Checklist Refactoring, Phase 6: Up-For-Grabs Pool & Modals, Phase 7: Onboarding & Settings (+1 more)

### Community 26 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 27 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 28 - "Household Core Specification"
Cohesion: 0.22
Nodes (9): Decision: Invite Code + Nickname & PIN Authentication, Household Core Delta Specification, Household Core Specification, Requirement: Household Creation, Requirement: Member Authentication and Session Management, Requirement: Member Away Status, Requirement: Household Role-Based Permissions, Requirement: Roommate Join via Invite Code (+1 more)

### Community 29 - "tasks.md"
Cohesion: 0.22
Nodes (8): 1. Foundation & Asset Setup, 2. Stationery Component Primitives, 3. Procedural Sound Engine & CSS 3D Navigation, 4. Appliance Dashboard Refactoring, 5. Chore Duty View & Ruled Paper Refactoring, 6. Up-For-Grabs Memo Board & Paperclipped Modals, 7. Onboarding Cover & Settings Refactoring, 8. Verification & Visual Audit

### Community 30 - "test_chore_up_for_grabs.py"
Cohesion: 0.46
Nodes (7): AsyncClient, asyncio, AsyncSession, test_claim_completed_chore_fails(), test_up_for_grabs_cross_household_returns_404(), test_up_for_grabs_pool_and_claim_unassigned(), test_up_for_grabs_pool_includes_away_member_chores()

### Community 31 - "5. Tactile Stationery Kit & Component Guidelines"
Cohesion: 0.25
Nodes (8): 5.1 Header & Tab Dividers, 5.2 Appliance Dashboard & Cards, 5.3 Chore Duty View & Weekly Checklist, 5.4 Up-for-Grabs Pool & Sticky Notes, 5.5 Modal Dialogs & Fasteners, 5.6 Onboarding & Interactive Notebook Cover, 5.7 Settings & Night Journal Toggle, 5. Tactile Stationery Kit & Component Guidelines

### Community 32 - "Notification System Specification"
Cohesion: 0.40
Nodes (5): Notification System Delta Specification, Requirement: Appliance State Push Notifications, Requirement: Weekly Chore Assignment Notifications, Notification System Specification, Requirement: Web Push Subscription Management

### Community 33 - "Skill: openspec-apply-change"
Cohesion: 0.33
Nodes (7): Change Selection & Prompting, Task Implementation Loop, Planning Context & Artifact Loader, Skill: openspec-apply-change, Task Progress Tracking & Checkbox Updates, Apply Task Execution Procedure, Workflow: opsx-apply

### Community 34 - "test_chore_completion.py"
Cohesion: 0.52
Nodes (6): AsyncClient, asyncio, AsyncSession, test_complete_and_log_cross_household_returns_404(), test_complete_single_weekly_chore(), test_log_continuous_duty_chore()

### Community 35 - "MVP System Architecture & Design"
Cohesion: 0.29
Nodes (7): Decision: Python FastAPI Backend, Decision: Multi-Household Scoped PostgreSQL Database, Decision: In-Memory WebSocket Rooms per Household, Database Schema Design (ERD), MVP System Architecture & Design, Requirement: Real-Time In-App WebSocket Broadcasting, Real-Time Live Sync & Web Push Notifications

### Community 36 - "Household Coordination App Documentation"
Cohesion: 0.33
Nodes (6): Requirement: 4-State Core Appliance State Machine, REST API & WebSocket Endpoint Reference, Docker Compose 1-Step Self-Hosting, 4-State Shared Appliance Tracking, Household Coordination App Documentation, Progressive Web Application (PWA) Client

### Community 37 - "Appliance Tracking Specification"
Cohesion: 0.25
Nodes (8): MVP Household Coordination Proposal, Appliance Tracking Delta Specification, MVP Household Coordination Implementation Tasks (TDD), OpenSpec Project Configuration, Appliance Tracking Specification, Requirement: Real-Time Elapsed Time and Activity Logging, Requirement: Preset and Custom Appliance Management, Requirement: Sensor-Ready Event Webhook

### Community 38 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 39 - "Skill: openspec-bulk-archive-change"
Cohesion: 0.40
Nodes (6): Batch Conflict Analysis & Ordering, Candidate Change Discovery & Filtering, Sequential Batch Archival Execution, Skill: openspec-bulk-archive-change, Bulk Archival Procedure, Workflow: opsx-bulk-archive

### Community 40 - "Skill: openspec-explore"
Cohesion: 0.33
Nodes (6): Artifact Decision Capture Mapping, Discovery Mindset & Exploratory Reasoning, Skill: openspec-explore, Visual Architecture & Flow Diagramming, Explore Dialogue Procedure, Workflow: opsx-explore

### Community 41 - "Skill: openspec-onboard"
Cohesion: 0.33
Nodes (6): OpenSpec CLI Command Reference, Delta Spec Concepts & Formatting, Guided Onboarding Lifecycle Walkthrough, Skill: openspec-onboard, Interactive Onboarding Tutorial Procedure, Workflow: opsx-onboard

### Community 42 - "Skill: openspec-verify-change"
Cohesion: 0.33
Nodes (6): Graceful Degradation & Verification Heuristics, Issue Severity Classification (Critical/Warning/Suggestion), Skill: openspec-verify-change, Three-Dimensional Verification Framework, Implementation Verification Procedure, Workflow: opsx-verify

### Community 43 - "FastAPI Backend Service"
Cohesion: 0.47
Nodes (6): Backend Python Dependencies, FastAPI Backend Service, PostgreSQL Database Service, Frontend Nginx Service, Docker Compose Stack, Frontend HTML Entrypoint

### Community 44 - "test_migrations.py"
Cohesion: 0.33
Nodes (4): alembic_config(), asyncio, fixture, test_async_migration_upgrade_and_downgrade()

### Community 45 - "Household Coordination App — Paper Notebook Design System"
Cohesion: 0.33
Nodes (5): 10. Design Token Cheat Sheet (Quick Reference), 6.1 Audio Effects Specification, 6.2 Implementation Code (`soundEngine.ts`), 6. Sound & Haptic Engine, Household Coordination App — Paper Notebook Design System

### Community 46 - "Chore Management Specification"
Cohesion: 0.22
Nodes (9): Decision: Weekly Duty Responsibility Shifts, Chore Management Delta Specification, Requirement: Chore Definition and Configuration, Chore Management Specification, Requirement: 1-to-1 Chore Swapping, Requirement: Hybrid Completion Tracking, Requirement: Up for Grabs Claim Pool, Requirement: Weekly Duty Assignment and Fair Rotation (+1 more)

### Community 47 - "Skill: openspec-archive-change"
Cohesion: 0.50
Nodes (5): Change Archival Sequence, Pre-Archive Verification Guard, Skill: openspec-archive-change, Archive Change Procedure, Workflow: opsx-archive

### Community 48 - "Skill: openspec-continue-change"
Cohesion: 0.50
Nodes (5): Artifact Schema Validation, Schema Progression & Next Artifact Resolution, Skill: openspec-continue-change, Continue Next Artifact Procedure, Workflow: opsx-continue

### Community 49 - "Skill: openspec-sync-specs"
Cohesion: 0.40
Nodes (5): Delta Specs Format (Added/Modified/Removed), Intelligent Delta Spec Merging, Skill: openspec-sync-specs, Sync Specs to Main Procedure, Workflow: opsx-sync

### Community 50 - "7.1 Breakpoint Specifications"
Cohesion: 0.40
Nodes (5): 1. Desktop Desk Surface ($\ge 1024\text{px}$), 2. Tablet Portrait ($768\text{px} - 1023\text{px}$), 3. Mobile Pocket Journal ($< 768\text{px}$), 7.1 Breakpoint Specifications, 7. Responsive Architecture & Breakpoints

### Community 51 - "2. Color Tokens & Surface Hierarchy"
Cohesion: 0.40
Nodes (5): 2.1 Daytime Paper Palette (Light Mode), 2.2 Pastel Highlighter Palette (Semi-Transparent Overlays), 2.3 Night Journal Palette (Dark Mode), 2.4 Tailwind CSS Configuration Extension, 2. Color Tokens & Surface Hierarchy

### Community 52 - "3. Typography System & Font Pairing"
Cohesion: 0.40
Nodes (5): 3.1 Typeface Selection Rationale, 3.2 Baseline Grid & Ruled Line Pitch, 3.3 Type Scale Hierarchy Table, 3.4 Google Fonts Web Loading Strategy, 3. Typography System & Font Pairing

### Community 53 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 54 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 55 - "/opsx-explore Command"
Cohesion: 0.50
Nodes (4): Exploratory Thinking & Ideation Mode, /opsx-explore Command, openspec-explore Skill, Thinking Partner Protocol

### Community 56 - "/opsx-sync Command"
Cohesion: 0.50
Nodes (4): Delta Spec Synchronization, /opsx-sync Command, Delta Sync Protocol, openspec-sync-specs Skill

### Community 57 - "test_health_check"
Cohesion: 0.50
Nodes (3): AsyncClient, asyncio, test_health_check()

### Community 58 - "1. Executive Design Vision & Visual Thesis"
Cohesion: 0.50
Nodes (4): 1.1 The Physical Notebook Metaphor, 1.2 Materiality, Paper Textures & Physics, 1.3 Lighting, Elevation & Shadows, 1. Executive Design Vision & Visual Thesis

### Community 59 - "4. Motion, Physics & Page-Flip Engine"
Cohesion: 0.50
Nodes (4): 4.1 3D Horizontal Page Turn Mechanism, 4.2 Tactile Micro-Interactions, 4.3 Reduced Motion Accessibility, 4. Motion, Physics & Page-Flip Engine

### Community 60 - "8. Accessibility (a11y) & Standards Compliance"
Cohesion: 0.50
Nodes (4): 8.1 Contrast Compliance Matrix, 8.2 Focus Indicators & Keyboard Navigation, 8.3 Screen Reader Semantics, 8. Accessibility (a11y) & Standards Compliance

## Knowledge Gaps
- **249 isolated node(s):** `BeforeInstallPromptEvent`, `PWAInstallPromptProps`, `ChoreCompletionType`, `UseHouseholdWebSocketOptions`, `ApplianceCardProps` (+244 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Member` to `test_full_roommate_lifecycle_simulation`, `test_households.py`, `chores.py`, `test_member_admin.py`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `ChoreAssignment` connect `chores.py` to `Member`, `test_chore_completion.py`, `test_chore_rotation.py`, `test_chore_swap.py`, `test_full_roommate_lifecycle_simulation`, `test_chore_up_for_grabs.py`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `PushSubscription` connect `Member` to `test_push_notifications.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `Member` (e.g. with `login()` and `claim_chore_assignment()`) actually correct?**
  _`Member` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Household` (e.g. with `login()` and `create_household()`) actually correct?**
  _`Household` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `ChoreAssignment` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`ChoreAssignment` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Chore` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`Chore` has 17 INFERRED edges - model-reasoned connections that need verification._