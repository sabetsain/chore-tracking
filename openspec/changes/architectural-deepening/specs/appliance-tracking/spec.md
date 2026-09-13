## MODIFIED Requirements

### Requirement: Core Appliance State Machine
The system SHALL encapsulate all appliance state machine transitions, step validations, canonical aliases, timer calculations, state audit logs, WebSocket notifications, and push alerts behind a deep service interface (`appliance_service.py`) that raises explicit domain exceptions.

#### Scenario: Advancing appliance state through domain service
- **WHEN** a state transition is requested for an appliance
- **THEN** the system executes the transition within `appliance_service.py`, validates the target state against the appliance's configured non-null steps, updates the current state, records an `ApplianceStateLog` entry with the appropriate trigger source, commits the transaction, broadcasts `APPLIANCE_STATE_CHANGED` via WebSocket, and triggers push notifications if the state is `clean_needs_emptying` or `needs_attention`.

#### Scenario: Enforcing domain exceptions on invalid transition
- **WHEN** an invalid or out-of-order state transition is requested without `force=true`
- **THEN** `appliance_service.py` raises an `ApplianceTransitionError`, which the HTTP router translates to a 400 Bad Request HTTP response.

#### Scenario: Appliance not found in household
- **WHEN** an operation is requested on an appliance ID that does not belong to the member's household
- **THEN** `appliance_service.py` raises an `ApplianceNotFoundError`, which the HTTP router translates to a 404 Not Found HTTP response.

#### Scenario: Resetting an appliance cycle
- **WHEN** an appliance reset is requested
- **THEN** `appliance_service.py` resets the appliance's `current_state` to `state_step_1`, clears all timer timestamps and durations, logs the transition with `trigger_source='reset'`, commits, and broadcasts the state change.

### Requirement: Seeding Default Appliances
The system SHALL centralize default appliance definitions and initial seeding inside `appliance_service.py`.

#### Scenario: Seeding default appliances for a new household
- **WHEN** a household is created
- **THEN** `household_service.py` invokes `appliance_service.seed_default_appliances(db, household_id)`, creating Washer, Dryer, and Dishwasher with canonical steps and timer defaults.

## REMOVED Requirements

### Requirement: Sensor-Ready Event Webhook
The system SHALL NOT maintain a dedicated HTTP webhook endpoint for speculative IoT smart plug power ingestion (`POST /api/v1/appliances/{id}/sensor-event`). All state transitions occur through explicit user actions, resets, or configuration modifications.
