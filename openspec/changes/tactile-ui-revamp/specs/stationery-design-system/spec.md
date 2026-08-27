## ADDED Requirements

### Requirement: Velocity-Sensitive Multi-Sensory Audio
The procedural sound engine SHALL modulate synthesized sound envelope, resonance, and filter frequencies based on user interaction velocity and action weight.

#### Scenario: Heavy action resonance modulation
- **WHEN** a user triggers a major state change (e.g. stamping an appliance dirty or running)
- **THEN** the sound engine synthesizes a deeper 65Hz desk-impact sub-bass layer and a distinct 1.6kHz rubber snap with ±5% procedural pitch jitter.

#### Scenario: Rapid sequential checkoff sound variation
- **WHEN** multiple items are checked off in quick succession
- **THEN** the sound engine dynamically modulates the noise filter cutoff and attack decay to prevent acoustic fatigue.

### Requirement: Micro-Haptic Signatures
The application SHALL emit distinct vibration signatures for key physical actions on supported mobile browsers via `navigator.vibrate`.

#### Scenario: Rubber stamp drop haptic pulse
- **WHEN** an appliance state transition stamp is dropped
- **THEN** the device triggers a double-thud vibration pattern `[20, 40, 30]`.

#### Scenario: Pencil checkbox toggle haptic tick
- **WHEN** a chore duty checkbox is completed
- **THEN** the device triggers a crisp single micro-tick vibration `[12]`.

### Requirement: Zero-Latency Optimistic UI Mutations
The application SHALL apply state transitions to local UI and audio layers immediately at 0ms latency prior to server roundtrip confirmation.

#### Scenario: Optimistic appliance state advancement
- **WHEN** a user taps to change an appliance state
- **THEN** the rubber stamp immediately animates down, sound/haptics fire instantly, and the query cache updates optimistically with automatic rollback on network failure.
