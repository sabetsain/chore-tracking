## ADDED Requirements

### Requirement: Countertop Screen Wake Lock Kiosk Mode
The application SHALL support keeping the screen illuminated without sleeping when the device is placed on a kitchen countertop or mounted to an appliance, via the Screen Wake Lock API.

#### Scenario: Enabling countertop kiosk mode
- **WHEN** the user enables "Countertop Kiosk Mode" in SettingsView
- **THEN** the system requests a `screen` wake lock via `navigator.wakeLock.request('screen')`, updates the UI toggle state, and prevents display timeout.

#### Scenario: Disabling countertop kiosk mode or tab visibility lost
- **WHEN** the user turns off the toggle or navigates away from the browser tab
- **THEN** the system releases the active wake lock gracefully.

### Requirement: Dynamic App Icon Badging
The application SHALL reflect urgent household state directly on the device app icon via the Web App Badging API.

#### Scenario: Updating app badge with pending counts
- **WHEN** appliances are in `clean_needs_emptying` state or chores are assigned and due today
- **THEN** the system sets the badge number using `navigator.setAppBadge(count)` to alert roommates from the OS home screen.

#### Scenario: Clearing app badge when no action required
- **WHEN** all appliances are emptied and all current chores are completed
- **THEN** the system clears the badge using `navigator.clearAppBadge()`.

### Requirement: Native Web Share API Export
The application SHALL allow roommates to export household invitation codes and grocery/chore lists directly through native OS sharing sheets.

#### Scenario: Exporting household invite code
- **WHEN** a member taps "Share Invite Code" on the Household settings page
- **THEN** the system opens the native OS share sheet via `navigator.share()` with the 6-character household code and direct join link.

### Requirement: Interactive Push Notification Action Handlers
The service worker SHALL support actionable notification buttons for appliance cycle completions.

#### Scenario: Emptying appliance directly from OS notification
- **WHEN** a roommate receives a push notification that an appliance finished and taps the "Empty Now" action button
- **THEN** the service worker dispatches a background API call to transition the appliance state to `empty` and broadcasts the update without requiring full foreground page launch.
