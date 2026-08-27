## MODIFIED Requirements

### Requirement: Chore Definition and Configuration
The system SHALL allow household members to create, view, update, and deactivate chores with a title, description, effort weight (1-5 points), and completion type ('single_weekly' or 'continuous_duty') directly from the chore user interface.

#### Scenario: Creating a new chore from UI
- **WHEN** a member submits a valid chore definition with title, effort weight, and completion type from the chore duty view modal
- **THEN** the system persists the chore scoped to the household, includes it in the active chore list, and immediately provisions an assignment for the active current week.

#### Scenario: Immediate assignment generation on chore creation
- **WHEN** a new chore is added to a household during an active week
- **THEN** the system generates a corresponding weekly chore assignment for the current week (assigned round-robin to an active member or made available in up-for-grabs) without requiring a week rollover.
