# household-core Specification

## Purpose
TBD - created by archiving change mvp-household-coordination. Update Purpose after archive.
## Requirements
### Requirement: Household Creation
The system SHALL allow a user to create a new household with a name, timezone, and automatically generated unique 6-character alphanumeric invite code.

#### Scenario: Successful household creation
- **WHEN** a user submits a valid household name and timezone
- **THEN** the system creates the household record, generates a unique 6-character invite code, registers the creator as the first member with role 'admin', and returns a session token.

### Requirement: Roommate Join via Invite Code
The system SHALL allow new roommates to join an existing household by supplying a valid 6-character invite code, a unique display nickname within that household, and an optional 4-digit PIN.

#### Scenario: Successful join with invite code
- **WHEN** a user provides a valid household invite code, a unique display nickname, and an optional 4-digit PIN
- **THEN** the system creates a new member record associated with that household with role 'member' and status 'active', and issues a session token.

#### Scenario: Invalid or expired invite code
- **WHEN** a user attempts to join with a non-existent or invalid invite code
- **THEN** the system rejects the request with a 404 Not Found error and an instructive message.

### Requirement: Member Authentication and Session Management
The system SHALL authenticate existing household members using their household ID, member nickname, and PIN (if set), issuing a cryptographically signed JWT session token.

#### Scenario: Member logs in with correct PIN
- **WHEN** a member submits their household identifier, nickname, and matching PIN
- **THEN** the system verifies the hash and returns an authenticated session token.

#### Scenario: Member logs in with incorrect PIN
- **WHEN** a member with a configured PIN submits an incorrect PIN
- **THEN** the system rejects the request with a 401 Unauthorized error.

### Requirement: Household Role-Based Permissions
The system SHALL distinguish between 'admin' and 'member' roles. Only admins SHALL have permission to regenerate household invite codes, update household settings, or remove members from the household.

#### Scenario: Admin regenerates invite code
- **WHEN** an admin member requests a new invite code
- **THEN** the system generates a new unique 6-character code, invalidates the previous code, and broadcasts the change to the household.

#### Scenario: Non-admin attempts restricted action
- **WHEN** a regular member attempts to remove another member or regenerate the invite code
- **THEN** the system denies the action with a 403 Forbidden error.

### Requirement: Member Away Status
The system SHALL allow members to set their status to 'away' (with an optional return date) to temporarily pause chore assignments and signal their absence to roommates.

#### Scenario: Member marks themselves away
- **WHEN** an active member sets their status to 'away' with an optional 'away_until' timestamp
- **THEN** the system updates their member status, excludes them from new weekly chore rotations, and marks any active uncompleted chores as eligible for the 'up for grabs' pool.

#### Scenario: Member returns from away
- **WHEN** an away member toggles their status back to 'active'
- **THEN** the system updates their status to 'active' and includes them in subsequent weekly rotation cycles.

