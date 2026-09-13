## MODIFIED Requirements

### Requirement: Unified Household Onboarding and Authentication Service
The system SHALL encapsulate household creation, unique invite code generation/rotation, member onboarding/joining, authentication/PIN verification, and member status updates within a deep domain service (`household_service.py`) that raises explicit domain exceptions.

#### Scenario: Creating a new household and onboarding the founding member
- **WHEN** a user initiates household creation
- **THEN** `household_service.py` creates the household, generates a collision-free 6-character invite code, hashes the optional PIN, creates the admin member, delegates default appliance seeding to `appliance_service.seed_default_appliances(db, household.id)`, commits the transaction, and returns the authentication token.

#### Scenario: Joining an existing household with unique nickname validation
- **WHEN** a user joins a household with an invite code and nickname
- **THEN** `household_service.py` validates the invite code, checks nickname uniqueness within the household, hashes the optional PIN, adds the member, commits, and returns an access token.

#### Scenario: Enforcing domain exceptions on invalid credentials or conflicts
- **WHEN** login fails due to an invalid PIN or an unknown member/invite code, or when joining with a duplicate nickname
- **THEN** `household_service.py` raises `InvalidCredentialsError`, `HouseholdNotFoundError`, `MemberNotFoundError`, or `NicknameConflictError`, which the HTTP router translates to 401, 404, or 400 HTTP responses.
