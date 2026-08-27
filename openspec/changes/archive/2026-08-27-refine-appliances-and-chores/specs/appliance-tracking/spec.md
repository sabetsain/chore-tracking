## MODIFIED Requirements

### Requirement: Preset and Custom Appliance Management
The system SHALL support predefined appliance presets (Dishwasher, Washing Machine, Dryer) with specialized state labels and restrict frontend appliance creation to supported presets.

#### Scenario: Creating a household with default appliance presets
- **WHEN** a new household is created
- **THEN** the system automatically seeds a Dishwasher, Washing Machine, and Dryer into the household's appliance list.

#### Scenario: Adding a preset appliance
- **WHEN** a member creates an appliance selecting an approved preset ('dishwasher', 'washer', 'dryer')
- **THEN** the system initializes the appliance with the default initial state ('empty' for washer/dryer, 'dirty' or 'empty' for dishwasher) and makes it visible to all household members.

#### Scenario: Disallowing custom appliance type creation in standard UI
- **WHEN** a member opens the add appliance modal
- **THEN** the type selection only offers standard supported presets (Dishwasher, Washing Machine, Dryer) and prevents custom cycle creation until future full customization engine support is released.

### Requirement: Core Appliance State Machine
The system SHALL manage appliance lifecycles across standardized states:
- **Dishwasher**: Direct cyclic lifecycle (`dirty` -> `running` -> `clean_needs_emptying` -> `dirty`). When marked emptied, the dishwasher automatically enters `dirty` (ready for dirty dishes), bypassing manual dirty tagging.
- **Washing Machine & Dryer**: Streamlined 3-state lifecycle (`empty` -> `running` -> `clean_needs_emptying` -> `empty`). In the `empty` state, the visual rubber stamp SHALL display "READY TO RUN!" (or "READY") instead of "NEEDS EMPTYING".

#### Scenario: Advancing dishwasher through streamlined cycle
- **WHEN** a member empties a clean dishwasher ('clean_needs_emptying' -> 'dirty')
- **THEN** the system validates the transition, updates current state to 'dirty', records the state log, and broadcasts the update so roommates immediately know it is ready to receive dirty dishes.

#### Scenario: Advancing washer or dryer through cycle with ready stamp
- **WHEN** a member views an emptied washer or dryer in state 'empty'
- **THEN** the system displays the "READY TO RUN!" rubber stamp and provides a 1-tap "Start Cycle" button transitioning it to 'running'.

#### Scenario: Preventing invalid direct state transition
- **WHEN** a transition request bypasses the state machine logic for that appliance type without an override flag (e.g. attempting 'empty' -> 'dirty' on a washing machine or 'empty' -> 'clean_needs_emptying' on any appliance)
- **THEN** the system rejects the transition with a 400 Bad Request error.
