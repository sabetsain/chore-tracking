## MODIFIED Requirements

### Requirement: Unified Chore Domain Service
The system SHALL encapsulate all chore template definitions (CRUD), weekly duty operations (claiming, unclaiming, completing, uncompleting, swapping, reassigning, logging continuous duty), and rotation algorithms within a deep service module (`chore_service.py`) that raises explicit domain exceptions and handles side-effects internally.

#### Scenario: Operating on chore duties through domain service
- **WHEN** a member claims, completes, uncompletes, or swaps a chore duty
- **THEN** `chore_service.py` validates the operation, mutates the assignment and chore logs, commits the transaction, and broadcasts `CHORE_UPDATED` or `CHORE_ROTATION_CHANGED` via WebSocket.

#### Scenario: Enforcing domain exceptions on invalid chore operations
- **WHEN** a member attempts an invalid chore operation (e.g. unclaiming a chore that is already completed, or swapping an unowned chore)
- **THEN** `chore_service.py` raises `ChoreValidationError` or `ChorePermissionError`, which the HTTP router translates to a 400 Bad Request or 403 Forbidden HTTP response.

#### Scenario: Chore or duty not found
- **WHEN** an operation targets a chore ID or assignment ID that does not exist in the member's household
- **THEN** `chore_service.py` raises `ChoreNotFoundError`, which the HTTP router translates to a 404 Not Found HTTP response.

## ADDED Requirements

### Requirement: Unified Chore Card Component
The system SHALL provide a unified, presentationally deep `ChoreCard` component supporting `mine`, `roommate`, and `pool` contexts, adhering to Warm Minimalist Functionalism (`DESIGN.md`).

#### Scenario: Rendering interactive personal duty card
- **WHEN** a member views a chore assigned to them
- **THEN** the system renders a `ChoreCard` in `mine` mode with a tactile scribble completion trigger, continuous duty tally counter (if applicable), action menu (swap, unclaim, edit), and acoustic feedback upon completion without skeuomorphic notebook clutters.

#### Scenario: Rendering passive roommate duty card
- **WHEN** a member views a chore assigned to a roommate
- **THEN** the system renders a `ChoreCard` in `roommate` mode showing the roommate's geometric `IdentitySticker`, completion status, and reassignment dropdown.

#### Scenario: Rendering open duty card in pool
- **WHEN** an unassigned or away member's chore appears in the Up-for-Grabs pool
- **THEN** the system renders a `ChoreCard` in `pool` mode with a prominent claim trigger and effort weight indicator.
