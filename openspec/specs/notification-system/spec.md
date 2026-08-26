# notification-system Specification

## Purpose
TBD - created by archiving change mvp-household-coordination. Update Purpose after archive.
## Requirements
### Requirement: Web Push Subscription Management
The system SHALL expose backend VAPID public keys and persist browser Web Push subscriptions associated with specific household members and devices.

#### Scenario: Registering a browser push subscription
- **WHEN** a member enables push notifications in the web client and submits the browser PushSubscription payload
- **THEN** the system stores the endpoint and encryption keys linked to that member and household.

#### Scenario: Unsubscribing or revoking push notifications
- **WHEN** a member disables notifications or a push service returns an expired subscription error (410 Gone)
- **THEN** the system removes the invalid subscription record from the database.

### Requirement: Appliance State Push Notifications
The system SHALL dispatch Web Push notifications to subscribed household members when an appliance finishes its cycle and requires attention.

#### Scenario: Notifying household when washing machine finishes
- **WHEN** the washing machine state transitions from 'running' to 'clean_needs_emptying'
- **THEN** the system queues and delivers a push notification to all subscribed household members with the title 'Washing Machine Finished' and instructions to transfer laundry.

### Requirement: Weekly Chore Assignment Notifications
The system SHALL dispatch Web Push notifications to members when weekly chore duties are rotated and assigned.

#### Scenario: Notifying member of new weekly assignment
- **WHEN** the weekly rotation cycle triggers and assigns a chore to an active member
- **THEN** the system sends a push notification to that member summarizing their assigned duties for the upcoming week.

### Requirement: Real-Time In-App WebSocket Broadcasting
The system SHALL maintain active WebSocket connections scoped to household rooms, broadcasting real-time JSON event packets for all chore updates and appliance state changes.

#### Scenario: Broadcasting live appliance state change
- **WHEN** any member updates an appliance state
- **THEN** the server immediately pushes a 'APPLIANCE_STATE_CHANGED' event to all connected WebSocket clients in that household within 200ms.

