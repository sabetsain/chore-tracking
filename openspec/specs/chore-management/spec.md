# chore-management Specification

## Purpose
TBD - created by archiving change mvp-household-coordination. Update Purpose after archive.
## Requirements
### Requirement: Chore Definition and Configuration
The system SHALL allow household members to create, view, update, and deactivate chores with a title, description, effort weight (1-5 points), and completion type ('single_weekly' or 'continuous_duty').

#### Scenario: Creating a new chore
- **WHEN** a member submits a valid chore definition with title, effort weight, and completion type
- **THEN** the system persists the chore scoped to the household and includes it in the active chore list.

### Requirement: Weekly Duty Assignment and Fair Rotation
The system SHALL organize chores into weekly responsibility shifts (Sunday midnight to Sunday midnight) and rotate assignments across all active (non-away) household members.

#### Scenario: Weekly rotation generation
- **WHEN** a new weekly cycle begins
- **THEN** the system assigns each active chore to the next active household member in the round-robin sequence, creating a new assignment record for that week.

#### Scenario: Away member skipped during rotation
- **WHEN** the weekly rotation runs and the next member in sequence is marked 'away'
- **THEN** the system skips that member, assigns the chore to the subsequent active member, and preserves the rotation index for when the away member returns.

### Requirement: Hybrid Completion Tracking
The system SHALL support two completion tracking models: single weekly completion for periodic deep cleaning tasks, and continuous instance logging for ongoing duties (such as taking out the trash).

#### Scenario: Completing a single weekly task
- **WHEN** an assigned member marks a 'single_weekly' chore as completed
- **THEN** the system records the completion timestamp, changes the assignment status to 'completed', and broadcasts the update to the household.

#### Scenario: Logging an instance of continuous duty
- **WHEN** a member on 'continuous_duty' logs a completion instance (e.g. emptied trash)
- **THEN** the system creates a timestamped chore log entry, increments the weekly instance counter, and keeps the assignment active for the remainder of the week.

### Requirement: Up for Grabs Claim Pool
The system SHALL place unassigned, orphaned, or away-member chores into an 'Up for Grabs' pool that any active roommate can claim.

#### Scenario: Active member claims an up for grabs chore
- **WHEN** an active member claims a chore currently in the 'Up for Grabs' pool
- **THEN** the system reassigns the weekly assignment to that member, removes it from the open pool, and broadcasts the assignment update to all household members.

### Requirement: 1-to-1 Chore Swapping
The system SHALL allow a member to propose or perform a 1-to-1 swap of their weekly assigned chore with another active member's assigned chore.

#### Scenario: Direct chore swap between members
- **WHEN** a member requests to swap their assigned weekly chore with another member's assigned weekly chore
- **THEN** the system updates the assignees on both assignment records and logs the swap in the activity history.

