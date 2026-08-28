## MODIFIED Requirements

### Requirement: Weekly Duty Assignment and Fair Rotation
The system SHALL organize active household chores into $N$ balanced difficulty buckets (where $N$ is the count of active, non-away household members) by partitioning chores to minimize effort weight variance, and rotate bucket assignments across members each weekly cycle (Sunday midnight to Sunday midnight).

#### Scenario: Balanced bucket partitioning and weekly rotation
- **WHEN** a new weekly cycle begins with $N$ active household members
- **THEN** the system partitions all active chores into $N$ balanced effort buckets and assigns each member their scheduled bucket for the week (`Member_i` receives `Bucket_{(i + week_index) mod N}`).

#### Scenario: Away member handling in bucket rotation
- **WHEN** a household member is marked 'away' during weekly assignment generation
- **THEN** the system adjusts the active member count $N$ to exclude the away member, partitions chores across remaining active members, or routes unassigned buckets to the up-for-grabs pool.

#### Scenario: Uneven chore distribution with fair effort balance
- **WHEN** chore count is not evenly divisible by member count
- **THEN** the partitioning algorithm balances total effort points (1-5 stars) across buckets such that no bucket has a total weight difference greater than the maximum individual chore weight.

### Requirement: Hybrid Completion Tracking
The system SHALL support completion tracking and reversible check-offs: single weekly completion for periodic cleaning tasks (which only the assigned member can check or uncheck), and continuous instance logging for ongoing duties.

#### Scenario: Completing a single weekly task by assigned member
- **WHEN** the assigned member marks their 'single_weekly' chore as completed
- **THEN** the system records the completion timestamp, changes the assignment status to 'completed', and broadcasts the update to the household.

#### Scenario: Non-assigned member prevented from checking chore
- **WHEN** a member attempts to complete a chore assignment assigned to another roommate
- **THEN** the system rejects the completion request with an authorization error.

#### Scenario: Unchecking an accidentally completed task
- **WHEN** the assigned member unchecks their previously completed 'single_weekly' chore
- **THEN** the system reverts the assignment status to 'pending', clears 'completed_at' and 'completed_by_member_id', and broadcasts the updated assignment to all household members.

#### Scenario: Logging an instance of continuous duty
- **WHEN** a member on 'continuous_duty' logs a completion instance (e.g. emptied trash)
- **THEN** the system creates a timestamped chore log entry, increments the weekly instance counter, and keeps the assignment active for the remainder of the week.

## ADDED Requirements

### Requirement: Collaborative Weekly Chore Reassignment
The system SHALL allow any active household member to reassign a specific weekly chore assignment to any other active household member for the current week without altering the chore's permanent bucket assignment in future rotation cycles.

#### Scenario: Reassigning a chore for the active week
- **WHEN** any household member selects a new assignee for an active weekly chore assignment
- **THEN** the system updates 'member_id' on that weekly assignment record, broadcasts the reassignment event to the household, and preserves the chore's home bucket for subsequent weekly generation cycles.

### Requirement: Dynamic Bucket Placement for New Chores
The system SHALL dynamically place newly created chores into the bucket with the lowest cumulative effort weight and immediately assign the chore to the active week's bucket holder.

#### Scenario: Adding a chore mid-week
- **WHEN** a user creates a new chore during an active week
- **THEN** the system assigns the chore to the bucket currently having the lowest total effort weight, creates an assignment for the member holding that bucket this week, and broadcasts the new chore and assignment.
