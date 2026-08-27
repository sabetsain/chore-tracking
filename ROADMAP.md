# Household Coordination App — Future Features & Product Roadmap

> **Document Version**: 1.0.0  
> **Status**: Living Architectural Specification & Feature Catalog  
> **Companion Document**: [`DESIGN.md`](file:///Users/sebastianmcconnell/Projects/chores/DESIGN.md) (Luxury Editorial Stationery Design System)  
> **Target Scope**: Next-generation capabilities, specialized domestic modules, and hardware integrations  

---

## 1. Executive Roadmap Vision & Philosophy

The **Household Coordination App** exists to make shared domestic living frictionless, equitable, and transparent while preserving a tactile, warm aesthetic. As the platform evolves beyond the MVP foundation, future capabilities are guided by three architectural pillars:

1. **Zero-Friction Domestic Physics**: Minimizing clicks, avoiding unnecessary manual state tagging, and letting the application adapt to how real households operate.
2. **Deep Customizability with High-Craft Defaults**: Empowering households with custom appliances, arbitrary state machines, and flexible duty schedules without forcing complexity on simple setups.
3. **Local-First & Ambient Hardware First**: Treating appliances and living spaces as physical environments that bridge seamlessly with e-ink displays, smart sensors, and local network automation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMESTIC ROADMAP MATRIX                           │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  1. Custom Appliance Engine   │  2. Advanced Chore Economics & Proof        │
│     • Custom Cycle Graph      │     • Karma / Effort Bidding Engine         │
│     • Multi-Stage Timers      │     • Ink-Stamp Photo Proof Ledger          │
│     • Sensor Power Profiles   │     • Vacation Auto-Rebalancing             │
├───────────────────────────────┼─────────────────────────────────────────────┤
│  3. Shared Pantry & Supplies  │  4. Ambient Hardware & IoT Bridge           │
│     • Shared Kitchen Staples  │     • Home Assistant / MQTT Plug Telemetry  │
│     • Expiry Visual Warning   │     • 7-inch E-Ink Fridge Kiosk Firmware    │
│     • Split Shopping Lists    │     • Local BLE Beacon Presence             │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Feature Specification: Fully Customizable Appliance Engine

### 2.1 Overview & Motivation
Standard appliances (Dishwasher, Washing Machine, Dryer) follow predictable state transitions. However, modern households frequently manage non-standard domestic machinery:
- **Robotic Vacuums & Mops** (Docked / Charging -> Cleaning -> Dustbin Needs Emptying -> Water Tank Refill)
- **Espresso Machines** (Cold -> Heating -> Ready -> Descaling Required)
- **Air Purifiers & Dehumidifiers** (Running -> Tank Full / Filter Service)
- **Sourdough Proofing & Fermentation Chambers** (Heating -> Proofing -> Ready)
- **3D Printers & Workshop Tools** (Preheating -> Printing -> Cool Down -> Finished / Bed Clearing)

The **Custom Appliance Engine** enables households to create arbitrary machinery with completely customizable state graphs, visual badges, and sensor integration rules.

### 2.2 Functional Architecture & State Graph Builder

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOM STATE GRAPH BUILDER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ State A: DOCKED ] ──( Start )──▶ [ State B: VACUUMING ]                 │
│          ▲                                   │                              │
│          │                               ( Finish )                         │
│          │                                   ▼                              │
│   ( Bin Emptied )                   [ State C: DUSTBIN FULL ]               │
│          │                                   │                              │
│          └───────────────────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Key Capabilities:
1. **Interactive State & Transition Builder**:
   - Define custom state keys (e.g. `docked`, `cleaning`, `bin_full`, `water_empty`).
   - Define directed transitions with custom button labels, icons (`lucide-react`), and color accents.
   - Configure terminal states and automatic cyclic loops.
2. **Dynamic Rubber Stamp Theming**:
   - Custom stamp text and ink colors (e.g. Oxblood Red, Cobalt Blue, Forest Green, Amber Ochre).
   - Custom rotation ranges and organic distressing styles matching `DESIGN.md`.
3. **Timed Duration & Auto-Advancement**:
   - Estimated cycle duration (e.g., "Normal Wash: 45 min", "Quick Dry: 30 min").
   - Optional automatic state transition or prompt dispatch upon timer completion.
4. **Smart Plug Power Profile Profiling**:
   - Record active power thresholds (e.g., `> 15W` indicates Active, `< 2W` indicates Idle).
   - Noise filtering to handle pause/soak cycles without premature "Clean/Finished" triggers.

---

## 3. Feature Specification: Advanced Chore Economics & Ledger

### 3.1 Effort Weight Karma & Bidding Market
- **Effort Karma Balance**: Each member maintains a running score of completed effort points.
- **Up-For-Grabs Bidding / Trade Bounties**: Members who are busy can attach "Karma Bounties" to chores they wish to offload to roommates.
- **Fairness Index**: A household analytics ledger showing historical distribution of effort points over 4, 12, and 52 weeks.

### 3.2 Chore Check-Off with Polaroid/Receipt Photo Proof
- **Stationery Photo Receipt**: Roommates can optionally attach a quick Polaroid-style photo slip (with simulated washi-tape corners) when completing deep cleaning tasks.
- **Sub-task Checklist**: Breaking large chores (e.g. "Clean Bathroom") into checkable mini-steps (Mirror, Toilet, Shower, Floor).

### 3.3 Grace Periods & Adaptive Away Rotations
- **Travel Mode**: Automatically redistribute chores during multi-week absences and smoothly re-enter the rotation without a backlog penalty.

---

## 4. Feature Specification: Ambient Hardware & Local IoT Bridge

### 4.1 Home Assistant & MQTT Webhook Ingestion
- **Local MQTT Broker Sync**: Native listener for Zigbee / Z-Wave / Matter smart plugs running on local networks.
- **Power Signature ML / Heuristics**: Auto-detect appliance cycle phases based on power draw curves.

### 4.2 Fridge Magnet E-Ink Dashboard (Hardware Client)
- **Ultra-low-power E-Ink Screen**: 7.5" waveshare e-paper display running on an ESP32 micro-controller.
- **Deep Sleep Sync**: Refreshes on appliance state change via lightweight HTTP/WebSocket endpoints with high-contrast paper textures optimized for 4-level grayscale e-paper.

```
+-------------------------------------------------------------+
|  [===] KITCHEN LOGBOOK E-INK MAGNET DISPLAY (7.5" 800x480)  |
|                                                             |
|   DISHWASHER           WASHING MACHINE      DRYER           |
|   [ DIRTY / LOAD ]     [ READY TO RUN ]     [ RUNNING ]     |
|   1h 20m ago           3h ago               42m remaining   |
|                                                             |
|  ---------------------------------------------------------  |
|   THIS WEEK'S DUTIES:                                       |
|   [X] Alice: Kitchen Floor      [ ] Bob: Trash & Recycling  |
|   [ ] Charlie: Bathroom         [ ] Dana: Living Room       |
+-------------------------------------------------------------+
```

---

## 5. Feature Specification: Shared Kitchen & Household Supplies

### 5.1 Shared Staples & Expiry Ledger
- **Running Staples Tracker**: Dishwasher tabs, detergent, olive oil, toilet paper, garbage bags.
- **1-Tap "Low Stock" Stamps**: Tap to stamp an item as `LOW` or `OUT`.
- **Shared Grocery Memo Pad**: Automatically aggregates low stock supplies into an organic ruled memo pad for whoever is at the store.

---

## 6. Implementation Prioritization

| Feature Phase | Name | Target Capabilities | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Chore & Appliance Polish** | Preset restrictions, "Ready to Run!" laundry stamp, direct dishwasher dirty cycle, "Add Chore" modal UI. | **Current Spec (`refine-appliances-and-chores`)** |
| **Phase 2** | **Custom Appliance Engine** | Custom cycle graph builder, arbitrary state definitions, custom stamp styling, power profile calibration. | **Planned (Spec in `ROADMAP.md`)** |
| **Phase 3** | **Chore Bounties & Proof** | Subtasks, Polaroid photo receipts, karma ledger, vacation rebalancing. | **Backlog** |
| **Phase 4** | **Shared Supplies & Kitchen** | Household staples list, low-stock alerts, grocery memo pad. | **Backlog** |
| **Phase 5** | **Ambient IoT & E-Ink** | Home Assistant MQTT bridge, ESP32 e-ink fridge display firmware. | **Backlog** |

---
