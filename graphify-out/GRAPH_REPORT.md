# Graph Report - chores  (2026-08-25)

## Corpus Check
- 140 files · ~75,271 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 695 nodes · 1469 edges · 63 communities (51 shown, 12 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 213 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend React Application & Components
- Backend API Routers & Alembic Environment
- Core Database Models & Chore Service
- OpenSpec Command Workflows & CLI Interface
- FastAPI App Entrypoint & WebSocket Manager
- Web Push Subscriptions & Notification Service
- Frontend TypeScript Configuration & Test Setup
- Appliance Sensor Events & State Tests
- Frontend Build & Testing Dependencies
- Chore CRUD API Integration Tests
- Member Admin & Permissions Tests
- Frontend Runtime Dependencies & UI Utilities
- Authentication & JWT Token Tests
- Household Creation & Join Tests
- Frontend Package Configuration & Scripts
- OpenSpec Change Creation & Fast-Forward Workflows
- Appliance CRUD & Isolation Tests
- Chore Rotation & Weekly Schedule Tests
- Chore Swapping Workflow Tests
- PWA Web App Manifest
- Frontend Node TypeScript Config
- Household Core Domain Specification
- Chore Management Domain Specification
- Chore Up For Grabs Pool Tests
- Appliance Tracking Domain Specification
- OpenSpec Apply Task Execution Workflow
- MVP System Architecture & Database Design
- OpenSpec Bulk Archive Workflow
- OpenSpec Exploration & Architecture Dialogue
- OpenSpec Onboarding Tutorial Workflow
- OpenSpec Implementation Verification Workflow
- Docker Compose Deployment & Services
- Database Migration Lifecycle Tests
- Appliance Tracking & REST API Documentation
- OpenSpec Archive Change Procedure
- OpenSpec Continue Change Procedure
- OpenSpec Delta Spec Synchronization Procedure
- Frontend Onboarding UI Component & Tests
- Notification System Domain Specification
- OpenSpec Exploration Mode & Commands
- OpenSpec Delta Spec Sync Commands
- Backend Health Check API Tests
- Autoprefixer CSS Configuration
- PostCSS Style Processor
- User Event Testing Library
- React Type Definitions
- React DOM Type Definitions
- Vite React Plugin
- Vitest Testing Framework
- PWA 192px Icon Asset
- PWA 512px Icon Asset
- App Vector SVG Icon Asset
- Agent Handoff Instructions
- OpenSpec Archive Metadata

## God Nodes (most connected - your core abstractions)
1. `Member` - 56 edges
2. `Household` - 27 edges
3. `ChoreAssignment` - 25 edges
4. `Chore` - 23 edges
5. `Appliance` - 21 edges
6. `PushSubscription` - 21 edges
7. `ApplianceStateLog` - 18 edges
8. `compilerOptions` - 17 edges
9. `Base` - 15 edges
10. `Member` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Zero-Friction Roommate Onboarding & Auth` --semantically_similar_to--> `Requirement: Roommate Join via Invite Code`  [INFERRED] [semantically similar]
  README.md → openspec/specs/household-core/spec.md
- `Intelligent Chore Rotation & Tracking` --semantically_similar_to--> `Requirement: Weekly Duty Assignment and Fair Rotation`  [INFERRED] [semantically similar]
  README.md → openspec/specs/chore-management/spec.md
- `4-State Shared Appliance Tracking` --semantically_similar_to--> `Requirement: 4-State Core Appliance State Machine`  [INFERRED] [semantically similar]
  README.md → openspec/specs/appliance-tracking/spec.md
- `Real-Time Live Sync & Web Push Notifications` --semantically_similar_to--> `Requirement: Real-Time In-App WebSocket Broadcasting`  [INFERRED] [semantically similar]
  README.md → openspec/specs/notification-system/spec.md
- `Skill: openspec-apply-change` --semantically_similar_to--> `Workflow: opsx-apply`  [INFERRED] [semantically similar]
  .agent/skills/openspec-apply-change/SKILL.md → .agent/workflows/opsx-apply.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OpenSpec Change Lifecycle Flow** — _agent_skills_openspec_new_change_skill_skill, _agent_skills_openspec_continue_change_skill_skill, _agent_skills_openspec_apply_change_skill_skill, _agent_skills_openspec_verify_change_skill_skill, _agent_skills_openspec_sync_specs_skill_skill, _agent_skills_openspec_archive_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Verification Dimensions Framework** — _agent_skills_openspec_verify_change_skill_three_dimensional_verification, _agent_skills_openspec_verify_change_skill_issue_severity_classification, _agent_skills_openspec_verify_change_skill_graceful_degradation [EXTRACTED 1.00]
- **OpenSpec Ideation to Specification Transition** — _agent_skills_openspec_explore_skill_skill, _agent_skills_openspec_explore_skill_discovery_mindset, _agent_skills_openspec_explore_skill_artifact_decision_capture, _agent_skills_openspec_new_change_skill_skill [EXTRACTED 1.00]
- **OpenSpec Standard Change Pipeline** — _opencode_commands_opsx_new_new_command, _opencode_commands_opsx_continue_continue_command, _opencode_commands_opsx_apply_apply_command, _opencode_commands_opsx_verify_verify_command, _opencode_commands_opsx_archive_archive_command [INFERRED 0.95]
- **OpenSpec Alternative Workflows** — _opencode_commands_opsx_explore_explore_command, _opencode_commands_opsx_ff_ff_command, _opencode_commands_opsx_sync_sync_command, _opencode_commands_opsx_bulk_archive_bulk_archive_command [INFERRED 0.85]
- **OpenSpec Core Skills Suite** — _opencode_skills_openspec_new_change_skill_new_change_skill, _opencode_skills_openspec_continue_change_skill_continue_change_skill, _opencode_skills_openspec_apply_change_skill_apply_change_skill, _opencode_skills_openspec_verify_change_skill_verify_change_skill, _opencode_skills_openspec_archive_change_skill_archive_change_skill, _opencode_skills_openspec_onboard_skill_onboard_skill [INFERRED 0.95]
- **OpenSpec Core Domain Capabilities** — openspec_specs_household_core_spec_household_core, openspec_specs_chore_management_spec_chore_management, openspec_specs_appliance_tracking_spec_appliance_tracking, openspec_specs_notification_system_spec_notification_system [EXTRACTED 1.00]
- **Docker Compose Self-Hosted Architecture** — docker_compose_db_service, docker_compose_backend_service, docker_compose_frontend_service [EXTRACTED 1.00]
- **Appliance IoT Sensor & Push Notification Flow** — openspec_specs_appliance_tracking_spec_four_state_machine, openspec_specs_appliance_tracking_spec_sensor_webhook, openspec_specs_notification_system_spec_appliance_push_notifications, openspec_specs_notification_system_spec_websocket_broadcasting [INFERRED 0.85]

## Communities (63 total, 12 thin omitted)

### Community 0 - "Frontend React Application & Components"
Cohesion: 0.06
Nodes (60): api, ApiError, getStoredToken(), request(), setStoredToken(), App(), MainApp(), queryClient (+52 more)

### Community 1 - "Backend API Routers & Alembic Environment"
Cohesion: 0.05
Nodes (80): do_run_migrations(), Run migrations in 'offline' mode., Run migrations in 'online' mode using async engine., Run migrations in 'online' mode using sync engine., Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online() (+72 more)

### Community 2 - "Core Database Models & Chore Service"
Cohesion: 0.10
Nodes (59): Base, Chore, ChoreAssignment, ChoreLog, Household, Member, claim_chore_assignment(), complete_chore_assignment() (+51 more)

### Community 3 - "OpenSpec Command Workflows & CLI Interface"
Cohesion: 0.07
Nodes (35): /opsx-apply Command, Store Selection Mechanism, Task-Driven Implementation Flow, /opsx-archive Command, Change Archival Workflow, Pre-Archive Validation Check, Batch Change Archival Workflow, /opsx-bulk-archive Command (+27 more)

### Community 4 - "FastAPI App Entrypoint & WebSocket Manager"
Cohesion: 0.11
Nodes (24): health_check(), get, decode_access_token(), ConnectionManager, Any, UUID, websocket_endpoint(), client() (+16 more)

### Community 5 - "Web Push Subscriptions & Notification Service"
Cohesion: 0.17
Nodes (29): PushSubscription, AsyncSession, delete, Member, post, subscribe(), unsubscribe(), create_appliance_payload() (+21 more)

### Community 6 - "Frontend TypeScript Configuration & Test Setup"
Cohesion: 0.07
Nodes (25): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+17 more)

### Community 7 - "Appliance Sensor Events & State Tests"
Cohesion: 0.24
Nodes (18): ApplianceStateLog, AsyncClient, asyncio, AsyncSession, test_sensor_event_appliance_not_found_returns_404(), test_sensor_event_completes_cycle_from_running(), test_sensor_event_ignored_when_no_threshold_met(), test_sensor_event_starts_cycle_from_dirty() (+10 more)

### Community 8 - "Frontend Build & Testing Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, jsdom, tailwindcss, @testing-library/jest-dom, @testing-library/react, @types/node, typescript, vite (+7 more)

### Community 9 - "Chore CRUD API Integration Tests"
Cohesion: 0.36
Nodes (13): AsyncClient, asyncio, AsyncSession, test_chore_unauthenticated_returns_401(), test_create_chore_continuous_duty(), test_create_chore_success(), test_create_chore_validation_effort_weight(), test_create_chore_validation_invalid_completion_type() (+5 more)

### Community 10 - "Member Admin & Permissions Tests"
Cohesion: 0.35
Nodes (13): AsyncClient, asyncio, AsyncSession, test_delete_member_as_admin_success(), test_delete_member_as_member_forbidden(), test_delete_member_cross_household_returns_404(), test_delete_nonexistent_member_returns_404(), test_regenerate_invite_code_as_admin() (+5 more)

### Community 11 - "Frontend Runtime Dependencies & UI Utilities"
Cohesion: 0.15
Nodes (13): clsx, dependencies, clsx, lucide-react, react, react-dom, tailwind-merge, @tanstack/react-query (+5 more)

### Community 12 - "Authentication & JWT Token Tests"
Cohesion: 0.44
Nodes (10): AsyncClient, asyncio, test_get_current_member_me_authenticated(), test_get_current_member_me_invalid_token(), test_get_current_member_me_unauthenticated(), test_login_missing_pin_when_required(), test_login_with_household_id_and_correct_pin(), test_login_with_incorrect_pin() (+2 more)

### Community 13 - "Household Creation & Join Tests"
Cohesion: 0.47
Nodes (9): AsyncClient, asyncio, AsyncSession, test_create_household_invalid_pin(), test_create_household_success(), test_create_household_without_pin(), test_join_household_duplicate_nickname(), test_join_household_invalid_invite_code() (+1 more)

### Community 14 - "Frontend Package Configuration & Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, preview, test, type (+1 more)

### Community 15 - "OpenSpec Change Creation & Fast-Forward Workflows"
Cohesion: 0.22
Nodes (9): Fast-Forward Artifact Generation, Skill: openspec-ff-change, Change Initialization & Scaffolding, OpenSpec Schema Selection, Skill: openspec-new-change, Fast-Forward Artifact Creation Procedure, Workflow: opsx-ff, New Change Creation Procedure (+1 more)

### Community 16 - "Appliance CRUD & Isolation Tests"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_appliances_unauthenticated_returns_401(), test_create_custom_appliance_default_type(), test_create_custom_appliance_success(), test_list_appliances_cross_household_isolation(), test_list_appliances_default_seeded()

### Community 17 - "Chore Rotation & Weekly Schedule Tests"
Cohesion: 0.47
Nodes (8): AsyncClient, asyncio, AsyncSession, test_get_assignments_default_current_week(), test_weekly_rotation_all_away_sets_member_none(), test_weekly_rotation_idempotent(), test_weekly_rotation_round_robin(), test_weekly_rotation_skips_away_member()

### Community 18 - "Chore Swapping Workflow Tests"
Cohesion: 0.44
Nodes (8): AsyncClient, asyncio, AsyncSession, test_swap_chore_assignments_success(), test_swap_chore_different_weeks_fails(), test_swap_chore_same_assignment_fails(), test_swap_completed_chore_fails(), test_swap_cross_household_returns_404()

### Community 19 - "PWA Web App Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 20 - "Frontend Node TypeScript Config"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 21 - "Household Core Domain Specification"
Cohesion: 0.22
Nodes (9): Decision: Invite Code + Nickname & PIN Authentication, Household Core Delta Specification, Household Core Specification, Requirement: Household Creation, Requirement: Member Authentication and Session Management, Requirement: Member Away Status, Requirement: Household Role-Based Permissions, Requirement: Roommate Join via Invite Code (+1 more)

### Community 22 - "Chore Management Domain Specification"
Cohesion: 0.22
Nodes (9): Decision: Weekly Duty Responsibility Shifts, Chore Management Delta Specification, Requirement: Chore Definition and Configuration, Chore Management Specification, Requirement: 1-to-1 Chore Swapping, Requirement: Hybrid Completion Tracking, Requirement: Up for Grabs Claim Pool, Requirement: Weekly Duty Assignment and Fair Rotation (+1 more)

### Community 23 - "Chore Up For Grabs Pool Tests"
Cohesion: 0.46
Nodes (7): AsyncClient, asyncio, AsyncSession, test_claim_completed_chore_fails(), test_up_for_grabs_cross_household_returns_404(), test_up_for_grabs_pool_and_claim_unassigned(), test_up_for_grabs_pool_includes_away_member_chores()

### Community 24 - "Appliance Tracking Domain Specification"
Cohesion: 0.25
Nodes (8): MVP Household Coordination Proposal, Appliance Tracking Delta Specification, MVP Household Coordination Implementation Tasks (TDD), OpenSpec Project Configuration, Appliance Tracking Specification, Requirement: Real-Time Elapsed Time and Activity Logging, Requirement: Preset and Custom Appliance Management, Requirement: Sensor-Ready Event Webhook

### Community 25 - "OpenSpec Apply Task Execution Workflow"
Cohesion: 0.33
Nodes (7): Change Selection & Prompting, Task Implementation Loop, Planning Context & Artifact Loader, Skill: openspec-apply-change, Task Progress Tracking & Checkbox Updates, Apply Task Execution Procedure, Workflow: opsx-apply

### Community 26 - "MVP System Architecture & Database Design"
Cohesion: 0.29
Nodes (7): Decision: Python FastAPI Backend, Decision: Multi-Household Scoped PostgreSQL Database, Decision: In-Memory WebSocket Rooms per Household, Database Schema Design (ERD), MVP System Architecture & Design, Requirement: Real-Time In-App WebSocket Broadcasting, Real-Time Live Sync & Web Push Notifications

### Community 27 - "OpenSpec Bulk Archive Workflow"
Cohesion: 0.40
Nodes (6): Batch Conflict Analysis & Ordering, Candidate Change Discovery & Filtering, Sequential Batch Archival Execution, Skill: openspec-bulk-archive-change, Bulk Archival Procedure, Workflow: opsx-bulk-archive

### Community 28 - "OpenSpec Exploration & Architecture Dialogue"
Cohesion: 0.33
Nodes (6): Artifact Decision Capture Mapping, Discovery Mindset & Exploratory Reasoning, Skill: openspec-explore, Visual Architecture & Flow Diagramming, Explore Dialogue Procedure, Workflow: opsx-explore

### Community 29 - "OpenSpec Onboarding Tutorial Workflow"
Cohesion: 0.33
Nodes (6): OpenSpec CLI Command Reference, Delta Spec Concepts & Formatting, Guided Onboarding Lifecycle Walkthrough, Skill: openspec-onboard, Interactive Onboarding Tutorial Procedure, Workflow: opsx-onboard

### Community 30 - "OpenSpec Implementation Verification Workflow"
Cohesion: 0.33
Nodes (6): Graceful Degradation & Verification Heuristics, Issue Severity Classification (Critical/Warning/Suggestion), Skill: openspec-verify-change, Three-Dimensional Verification Framework, Implementation Verification Procedure, Workflow: opsx-verify

### Community 31 - "Docker Compose Deployment & Services"
Cohesion: 0.47
Nodes (6): Backend Python Dependencies, FastAPI Backend Service, PostgreSQL Database Service, Frontend Nginx Service, Docker Compose Stack, Frontend HTML Entrypoint

### Community 32 - "Database Migration Lifecycle Tests"
Cohesion: 0.33
Nodes (4): alembic_config(), asyncio, fixture, test_async_migration_upgrade_and_downgrade()

### Community 33 - "Appliance Tracking & REST API Documentation"
Cohesion: 0.33
Nodes (6): Requirement: 4-State Core Appliance State Machine, REST API & WebSocket Endpoint Reference, Docker Compose 1-Step Self-Hosting, 4-State Shared Appliance Tracking, Household Coordination App Documentation, Progressive Web Application (PWA) Client

### Community 34 - "OpenSpec Archive Change Procedure"
Cohesion: 0.50
Nodes (5): Change Archival Sequence, Pre-Archive Verification Guard, Skill: openspec-archive-change, Archive Change Procedure, Workflow: opsx-archive

### Community 35 - "OpenSpec Continue Change Procedure"
Cohesion: 0.50
Nodes (5): Artifact Schema Validation, Schema Progression & Next Artifact Resolution, Skill: openspec-continue-change, Continue Next Artifact Procedure, Workflow: opsx-continue

### Community 36 - "OpenSpec Delta Spec Synchronization Procedure"
Cohesion: 0.40
Nodes (5): Delta Specs Format (Added/Modified/Removed), Intelligent Delta Spec Merging, Skill: openspec-sync-specs, Sync Specs to Main Procedure, Workflow: opsx-sync

### Community 37 - "Frontend Onboarding UI Component & Tests"
Cohesion: 0.50
Nodes (3): Onboarding(), OnboardingProps, Tab

### Community 38 - "Notification System Domain Specification"
Cohesion: 0.40
Nodes (5): Notification System Delta Specification, Requirement: Appliance State Push Notifications, Requirement: Weekly Chore Assignment Notifications, Notification System Specification, Requirement: Web Push Subscription Management

### Community 39 - "OpenSpec Exploration Mode & Commands"
Cohesion: 0.50
Nodes (4): Exploratory Thinking & Ideation Mode, /opsx-explore Command, openspec-explore Skill, Thinking Partner Protocol

### Community 40 - "OpenSpec Delta Spec Sync Commands"
Cohesion: 0.50
Nodes (4): Delta Spec Synchronization, /opsx-sync Command, Delta Sync Protocol, openspec-sync-specs Skill

### Community 41 - "Backend Health Check API Tests"
Cohesion: 0.50
Nodes (3): AsyncClient, asyncio, test_health_check()

## Knowledge Gaps
- **148 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Core Database Models & Chore Service` to `Backend API Routers & Alembic Environment`, `Household Creation & Join Tests`, `Member Admin & Permissions Tests`, `Web Push Subscriptions & Notification Service`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `ChoreAssignment` connect `Core Database Models & Chore Service` to `Chore Rotation & Weekly Schedule Tests`, `Chore Swapping Workflow Tests`, `Chore Up For Grabs Pool Tests`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `ApplianceStateLog` connect `Appliance Sensor Events & State Tests` to `Backend API Routers & Alembic Environment`, `Core Database Models & Chore Service`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 40 inferred relationships involving `Member` (e.g. with `create_appliance()` and `get_appliance_history()`) actually correct?**
  _`Member` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Household` (e.g. with `login()` and `create_household()`) actually correct?**
  _`Household` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `ChoreAssignment` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`ChoreAssignment` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Chore` (e.g. with `claim_chore_assignment()` and `complete_chore_assignment()`) actually correct?**
  _`Chore` has 17 INFERRED edges - model-reasoned connections that need verification._