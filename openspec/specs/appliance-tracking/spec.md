# appliance-tracking Specification

## Purpose
Track household appliance availability, active cycles, and clean/dirty states across shared machinery.

## Requirements
### Requirement: Preset and Custom Appliance Management
The system SHALL support both predefined appliance presets (Dishwasher, Washing Machine, Dryer) and custom household appliances, storing an ordered cycle of 2 to 5 state steps from an approved canonical universe (`empty`, `dirty`, `running`, `needs_attention`, `clean`) with optional timer configuration.

#### Scenario: Creating a custom appliance with a linear cycle
- **WHEN** a member creates an appliance with name "Espresso Machine", icon "coffee", cycle steps `['empty', 'running', 'needs_attention']`, and `timer_enabled=true`
- **THEN** the system validates that all steps are valid canonical states, stores the steps in sequential slots (`state_step_1='empty'`, `state_step_2='running'`, `state_step_3='needs_attention'`), initializes `current_state` to `state_step_1`, and broadcasts the new appliance to the household.

#### Scenario: Enforcing state membership at database level
- **WHEN** an appliance is saved with a `current_state` that is not equal to any of its configured non-null step slots (`state_step_1` through `state_step_5`)
- **THEN** the database rejects the row via check constraint `ck_appliance_current_state_in_steps`.

#### Scenario: Seeding default household appliances with streamlined 3-step linear cycles
- **WHEN** a new household is initialized
- **THEN** the system creates default appliances with pre-configured step slots:
  - Washer: `['empty', 'running', 'needs_attention']`, `timer_enabled=true`, `default_timer_minutes=45`
  - Dryer: `['empty', 'running', 'needs_attention']`, `timer_enabled=true`, `default_timer_minutes=45`
  - Dishwasher: `['dirty', 'running', 'needs_attention']`, `timer_enabled=true`, `default_timer_minutes=60`

#### Scenario: Editing cycle steps of an existing appliance
- **WHEN** a member updates the cycle steps of an existing appliance
- **THEN** the system persists the updated steps, automatically resets `current_state` to the new `state_step_1`, cancels any active timers, and broadcasts the update.

### Requirement: Core Appliance State Machine
The system SHALL manage appliance lifecycles strictly along their configured linear cycle ($S_1 \rightarrow S_2 \rightarrow \dots \rightarrow S_k \rightarrow S_1$), where exactly one valid next state exists at any point in the cycle.

#### Scenario: Advancing appliance to its deterministic next state
- **WHEN** a member advances an appliance currently in `state_step_2` of a 3-step cycle (`['empty', 'running', 'needs_attention']`)
- **THEN** the system validates that `to_state` equals `state_step_3` ('needs_attention'), updates `current_state`, creates an audit log entry, and broadcasts the update.

#### Scenario: Looping from final step back to initial step
- **WHEN** a member advances an appliance currently in the last non-null step of its cycle
- **THEN** the system advances `current_state` to `state_step_1`, completing the linear cycle.

#### Scenario: Rejecting out-of-order state transition
- **WHEN** a member attempts to transition an appliance to a state that is not the immediate next step in its configured cycle without `force=true`
- **THEN** the system rejects the transition with a 400 Bad Request error specifying the expected next state.

#### Scenario: Aborting / Resetting an active cycle
- **WHEN** a member invokes the abort/reset action on a running or in-progress appliance
- **THEN** the system resets `current_state` to `state_step_1`, clears any active countdown timers (`timer_started_at=None`, `timer_ends_at=None`), records an audit log entry with `trigger_source='reset'`, and broadcasts the update.

### Requirement: Real-Time Elapsed Time and Activity Logging
The system SHALL track the exact timestamp of each state change, compute elapsed time in the current state, and maintain an audit log of recent state transitions with actor metadata.

#### Scenario: Viewing appliance status with duration
- **WHEN** a member views an appliance that has been running for 45 minutes
- **THEN** the system displays the active 'running' badge, calculates an elapsed duration of '45m', and shows the name of the roommate who started it.

### Requirement: Sensor-Ready Event Webhook
The system SHALL provide a dedicated ingestion endpoint for IoT smart plug sensor telemetry (e.g., power draw in watts) that maps to state machine transitions without modifying database models.

#### Scenario: Ingesting smart plug cycle completion event
- **WHEN** an external sensor webhook sends a telemetry payload indicating power drop below 2W after a sustained running cycle
- **THEN** the system automatically transitions the appliance from 'running' to 'clean_needs_emptying', tags the actor as 'sensor_webhook', and notifies the household.

### Requirement: Mandatory Run Timers and Human Confirmation
The system SHALL support time-boxed appliance operations requiring duration entry on cycle start, emitting notifications upon timer completion, and requiring explicit human confirmation before advancing to the subsequent state.

#### Scenario: Starting an appliance with quick-tap timer presets
- **WHEN** a member initiates the run transition for an appliance with `timer_enabled=true`
- **THEN** the UI presents quick-tap preset chips (15m, 30m, 45m, 60m, and the appliance's default duration) along with a custom minute input, and requires a positive duration before dispatching the transition.

#### Scenario: Preventing run transition without timer duration
- **WHEN** a member attempts to transition an appliance with `timer_enabled=true` to `running` without providing `timer_duration_minutes` (or with duration <= 0)
- **THEN** the system rejects the transition with a 422/400 validation error stating that a timer duration is required.

#### Scenario: Notifying household upon timer completion
- **WHEN** an appliance timer reaches `timer_ends_at`
- **THEN** the system triggers an in-app acoustic chime via `soundEngine`, displays a prominent visual "Cycle Complete — Confirmation Needed" alert banner, and dispatches a Web Push notification to household members.

#### Scenario: Requiring human confirmation after timer completion
- **WHEN** the current time passes `timer_ends_at` for an appliance in state `running`
- **THEN** the system maintains `current_state` as `running`, displays the confirmation-needed alert, and enables an action button requiring a member to explicitly confirm the completion before transitioning to the next step.

