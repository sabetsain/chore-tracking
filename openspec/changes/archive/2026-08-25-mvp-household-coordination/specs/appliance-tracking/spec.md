## ADDED Requirements

### Requirement: Preset and Custom Appliance Management
The system SHALL support predefined appliance presets (Dishwasher, Washing Machine, Dryer) with specialized state labels, and allow household members to create custom appliances.

#### Scenario: Creating a household with default appliance presets
- **WHEN** a new household is created
- **THEN** the system automatically seeds a Dishwasher, Washing Machine, and Dryer into the household's appliance list.

#### Scenario: Adding a custom appliance
- **WHEN** a member creates a custom appliance with a custom name and type
- **THEN** the system initializes the appliance with the default 'empty' state and makes it visible to all household members.

### Requirement: 4-State Core Appliance State Machine
The system SHALL manage appliance lifecycle across four standardized states: 'empty', 'dirty' (or loaded/in-use), 'running', and 'clean_needs_emptying' (or wet/dry ready for attention).

#### Scenario: Advancing appliance through complete cycle
- **WHEN** a member triggers successive state transitions ('empty' -> 'dirty' -> 'running' -> 'clean_needs_emptying' -> 'empty')
- **THEN** the system validates each transition, updates the current state and timestamp, appends an entry to the appliance state log, and broadcasts the new state over WebSockets.

#### Scenario: Preventing invalid direct state transition
- **WHEN** a transition request bypasses the state machine logic without an override flag
- **THEN** the system rejects the transition with a 400 Bad Request error.

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
