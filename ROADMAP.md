# Household Coordination App — Future Features & Product Roadmap

> **Document Version**: 1.1.0  
> **Status**: Living Architectural Specification & Feature Catalog  
> **Companion Document**: [`DESIGN.md`](file:///Users/sebastianmcconnell/Projects/chores/DESIGN.md) (Luxury Editorial Stationery Design System)  
> **Target Scope**: Next-generation capabilities, specialized domestic modules, culinary intelligence, ambient multiplayer presence, and hardware integrations  

---

## 1. Executive Roadmap Vision & Philosophy

The **Household Coordination App** exists to make shared domestic living frictionless, equitable, and transparent while preserving a tactile, warm aesthetic. As the platform evolves beyond the MVP foundation, future capabilities are guided by four architectural pillars:

1. **Zero-Friction Domestic Physics**: Minimizing clicks, avoiding unnecessary manual state tagging, and letting the application adapt to how real households operate.
2. **Deep Customizability with High-Craft Defaults**: Empowering households with custom appliances, arbitrary state machines, and flexible duty schedules without forcing complexity on simple setups.
3. **Local-First & Ambient Hardware First**: Treating appliances and living spaces as physical environments that bridge seamlessly with e-ink displays, smart sensors, and local network automation.
4. **Communal Warmth & The Internet as a Bench**: Treating domestic software not as a sterile, corporate task tracker, but as a digital third place and kitchen-table bench—an unhurried, shared space with ambient multiplayer co-presence, tactile collective artifacts, and joyful micro-interactions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMESTIC ROADMAP MATRIX                           │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  1. Custom Appliance Engine   │  2. Advanced Chore Economics & Proof        │
│     • Custom Cycle Graph      │     • Karma / Effort Bidding Engine         │
│     • Multi-Stage Timers      │     • Ink-Stamp Photo Proof Ledger          │
│     • Sensor Power Profiles   │     • Vacation Auto-Rebalancing             │
├───────────────────────────────┼─────────────────────────────────────────────┤
│  3. Ambient Hardware & IoT    │  4. Culinary & Smart Pantry Engine          │
│     • Home Assistant / MQTT   │     • Dinner Duty Recipe Suggester          │
│     • 7-inch E-Ink Magnet     │     • Local Store Price Cost Estimator      │
│     • Smart Plug Profiling    │     • 1-Tap "Running Low" Pantry Ledger     │
├───────────────────────────────┼─────────────────────────────────────────────┤
│  5. The Digital Kitchen Bench │  6. Household Lore & Micro-Gestures         │
│     • Ambient Co-Presence     │     • Shared Milestone Tally String         │
│     • Fridge Magnet Graffito  │     • "Kettle's Boiling" Household Bell     │
│     • Collaborative Canvas    │     • Gratitude Wax Seals & Daily Prompts   │
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

## 5. Feature Specification: Culinary Coordination, Smart Pantry & Recipe Cost Engine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CULINARY COORDINATION & PANTRY ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ Weekly "Cook Dinner" Duty ] ──▶ [ Pantry-First Recipe Suggestions ]     │
│                 │                                  │                        │
│                 ▼                                  ▼                        │
│   [ Household Dietary Filters ]         [ In-Stock Inventory Check ]        │
│   (Vegetarian, Allergies, Quick)                   │                        │
│                                                    ▼                        │
│                                    [ Missing Ingredient Calculation ]       │
│                                                    │                        │
│                                                    ▼                        │
│                                    [ Local Supermarket Price Scraper ]      │
│                                                    │                        │
│                                                    ▼                        │
│                                    ┌───────────────────────────────┐        │
│                                    │ ESTIMATED MEAL COST: $8.40    │        │
│                                    │ ($2.10 / serving for 4 ppl)   │        │
│                                    └───────────────────────────────┘        │
│                                                    │                        │
│                                                    ▼                        │
│   [ Auto-Add Missing to Memo Pad ] ◀─── [ 1-Tap "Running Low" Stamps ]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Dinner Duty Assistant & Smart Recipe Suggester
For roommates assigned the recurring "Cook Dinner" or "Meal Prep" chore, decision paralysis is often the hardest part of the duty. The Culinary Assistant acts as an inspiring, low-stress sous-chef:
- **Pantry-First Cooking**: Suggests dinner ideas ranked by the percentage of required ingredients already sitting in the household fridge, freezer, and dry pantry, minimizing food waste.
- **Household Palate Profile**: Automatically accommodates all roommates' recorded dietary restrictions, food allergies, and preferences (e.g., "Alice is vegetarian, Bob is lactose-intolerant, Dana dislikes cilantro").
- **Prep Time & Effort Modes**: Filters by weeknight reality:
  - *Quick Rush* (15–20 minutes, 1-pot meals).
  - *Balanced Comfort* (30–45 minutes).
  - *Sunday Feast / Communal Meal* (60+ minutes, batch cooking).
- **Inspirational Recipe Index**: Built-in library of comforting, roommate-tested recipes with step-by-step stationery recipe index cards, plus support for importing custom web recipes or family favorites.

### 5.2 Household Pantry Inventory & "Running Low" Ledger
A lightweight, non-tedious inventory system formatted as a ruled kitchen memo slip:
- **Pantry Storage Zones**: Organized by physical location (`Fridge`, `Freezer`, `Dry Pantry`, `Spice Rack`, `Household Cleaning Supplies`).
- **1-Tap "Running Low" & "Out of Stock" Stamps**:
  - Roommates don't need to count grams or scan barcodes. When an item is nearly finished (e.g. olive oil, eggs, oat milk), a single tap applies a distressed rubber stamp: `RUNNING LOW` (Amber) or `OUT OF STOCK` (Oxblood).
  - Items stamped `RUNNING LOW` or `OUT OF STOCK` automatically flow straight into the household's active **Ruled Shopping Memo Pad**.
- **Freshness & Leftover Tracker**:
  - When dinner is completed, the cook can stamp a virtual "Leftover Container Slip" with an organic "Eat By: [Date]" highlighter tag, visible to all roommates on the kitchen dashboard.

### 5.3 Dynamic Recipe Cost Engine & Local Store API Pricing
The price estimation engine shows the real, immediate cost required to make a dinner recipe—calculated as **the cost of groceries needed minus what is already in stock at home**, fetched in real-time via the local grocery store API:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECIPE PRICE ESTIMATION FORMULA                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ Total Recipe Ingredients ]  -  [ In-Stock Household Groceries ]        │
│                                 ▼                                           │
│                     [ Missing Groceries Needed ]                            │
│                                 ▼ (Store API Query)                         │
│             [ Real-Time Local Grocery Store Price Call ]                    │
│                                 ▼                                           │
│                 ┌────────────────────────────────┐                          │
│                 │   ESTIMATED RECIPE COST: $6.20 │                          │
│                 │   ($0.00 if all in stock!)     │                          │
│                 └────────────────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Missing Groceries Net Cost Calculation**:
  - The system checks the recipe's ingredient list against the household's current pantry/fridge inventory.
  - Ingredients already at home contribute $\$0.00$ to the estimated recipe cost.
  - For each missing grocery item, the backend queries the configured local grocery store API (e.g., Kroger API, local supermarket price search, or open grocery index) to retrieve the current shelf price.
  - The displayed recipe estimate is strictly the sum of the missing groceries needed:
    $$\text{Estimated Dinner Cost} = \sum_{i \in (\text{Recipe Ingredients} \setminus \text{In-Stock Pantry})} \text{Store API Price}(i)$$
  - If 100% of the recipe's ingredients are on hand, the recipe prominently displays: `Est. Cost: $0.00 (All ingredients at home!)`.
- **Local Grocery Store API Integration**:
  - Configurable local grocery store per household (or nearest chain store by postal/zip code, e.g., Kroger, Trader Joe's, Aldi, Woolworths, Albert Heijn).
  - Queries store item search / product price endpoints with ingredient name and standard packaged quantity.
- **Cost-Per-Serving & Household Split**:
  - Shows both the total estimated grocery purchase cost and the per-roommate share (e.g. *"Total needed: \$6.20 — \$1.55 / person"*).
- **1-Tap "Add Missing to Shopping List"**:
  - With a single click on the recipe card, all missing grocery items are added directly into the household's shared **Ruled Shopping Memo Pad**.

---

## 6. Feature Specification: The Digital Kitchen Bench (Multi-Presence & Collective Tactile UI)

```
+-------------------------------------------------------------------------------+
|  THE KITCHEN BENCH (A Digital Third Place for the Household)                  |
|                                                                               |
|   "The internet is a bench: an unhurried, collective structure where people   |
|    sit side-by-side, carve initials into wood, leave a book for the next      |
|    visitor, and quietly share space without transactional pressure."          |
|                                                                               |
|   +------------------------------------+  +--------------------------------+  |
|   |  FRIDGE MAGNET GRAFFITO CANVAS     |  |  COMMUNAL HEARTH & PRESENCE    |  |
|   |                                    |  |                                |  |
|   |   [ Vintage Tomato Magnet ]        |  |   Sitting on the bench:        |  |
|   |   "Don't forget movie night!"      |  |   ☕ Alice (steaming mug)       |  |
|   |   ~ sketched smiley face (Roughjs) |  |   ✏️ Jordan (writing note)      |  |
|   |   [ Polaroid: Clean Kitchen ✨ ]   |  |                                |  |
|   |                                    |  |   [🔔 RING KETTLE'S BOILING]   |  |
|   |                                    |  |   (Plays warm acoustic chime)  |  |
|   +------------------------------------+  +--------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 6.1 Design Philosophy: "The Internet as a Bench"
Mainstream productivity software views domestic life through an extractive, transactional lens of tickets, deadlines, and notifications. Drawing inspiration from Chia Amisola's *The Internet is a Bench* and the ambient, cozy web movement, the **Kitchen Bench** re-imagines the household app as a communal physical object—like a weathered wooden bench in a shared courtyard or a cluttered family refrigerator door:
- **Unhurried & Non-Demanding**: It doesn't nag or demand engagement. It exists as an ambient fixture that feels alive when people are around.
- **Traces of Presence Over Activity Streams**: Rather than an audit log of "User X modified record Y at 14:02", the interface captures human presence—a warm pencil doodle, a magnet shifted slightly to the left, a steaming coffee cup icon, or an affectionate gratitude seal.

### 6.2 Ambient Multiplayer Co-Presence (No Surveillance)
- **"Sitting on the Bench" Presence Avatars**:
  - When roommates open the app, their avatar appears on the top bench rail as a cozy tactile illustration (e.g. a steaming ceramic mug, a resting cat, an open book, or a wooden pencil) drawn in their personal accent color.
  - No invasive typing indicators or "last seen 3 minutes ago" timestamps; simply a warm, living sense of shared co-presence.
- **Ambient Micro-Soundscapes & Spatial Rustle**:
  - Optional, ultra-subtle procedural audio cues when roommates interact simultaneously: the faint sound of paper rustling, soft graphite scribbling, or a gentle wooden tap when a roommate stamps a chore.

### 6.3 Communal Corkboard & Fridge Magnet Graffito Canvas
An open, shared interactive canvas integrated into the left page spread or an ambient drawer:
- **Tactile Fridge Magnets**:
  - Household members can move, rotate, and pin whimsical 3D skeuomorphic fridge magnets (ceramic letters, vintage fruit stickers, brass clips, souvenir stamps).
- **Organic Graphite & Chalk Scribbles (`Rough.js`)**:
  - Fast, expressive hand-drawn doodling and quick margin notes. Roommates can write a joke, draw a flower, or sketch a celebratory checkmark that persists on the household board.
- **Perforated Memo Scraps & Polaroid Snaps**:
  - Pin torn kraft paper scraps, funny quotes overheard in the kitchen, or spontaneous photos taped with translucent washi tape.

### 6.4 Collective Tactile Hearth Artifacts & Micro-Gestures
- **The "Kettle's Boiling / Coffee's Brewed" Bell**:
  - A tactile brass bell on the bench header. When someone puts the kettle on or brews a fresh French press in the kitchen, tapping the bell plays a gentle, resonant acoustic chime on active household devices and drops a temporary steaming teapot badge on the bench ("Fresh coffee in the kitchen!").
- **Gratitude Wax Seals & Golden Star Impressions**:
  - Instead of standard emoji reactions, roommates can drop embossed wax seals, golden foil stars, or custom inked stamps (`HERO`, `CHEF'S KISS`, `THANK YOU`) onto someone's completed dinner or deep cleaning card.
- **Communal Habit & Milestone Bead String**:
  - A physical, wooden abacus or bead chain rendered with canvas physics: roommates slide beads together to count collective milestones (e.g. "30 Days of Zero Food Waste", "100 Home-Cooked Meals Shared", "50 Dishwasher Cycles Emptied on Time").
- **The Daily Kitchen Table Prompt / Haiku of the Day**:
  - A single-line ruled strip at the bottom of the logbook with a low-friction, playful daily prompt (e.g. "Song of the morning?", "What's the best thing you ate this week?", "One-sentence house haiku").

---

## 7. Implementation Prioritization & Roadmap Phasing

| Feature Phase | Name | Target Capabilities | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Custom Appliance Engine** | Linear cycle step builder (2-5 slots), canonical state stamps, timer duration picker with mandatory human confirmation, cycle abort & edit safeguards. | **Completed (OpenSpec change: `custom-appliance-engine`)** |
| **Phase 2** | **Culinary & Smart Pantry Engine** | Pantry inventory, 1-tap `LOW` / `OUT` stamps, dinner duty recipe suggestions, local store API price estimation. | **Next Priority (Spec in Section 5)** |
| **Phase 3** | **The Digital Kitchen Bench** | Ambient multiplayer co-presence, communal fridge magnet graffito, kettle bell, gratitude wax seals, milestone bead string. | **Planned (Spec in Section 6)** |
| **Phase 4** | **Chore Bounties & Proof** | Subtasks, Polaroid photo receipts, karma ledger, vacation rebalancing. | **Backlog (Spec in Section 3)** |
| **Phase 5** | **Ambient Hardware & E-Ink IoT** | Home Assistant MQTT bridge, ESP32 e-ink fridge display firmware, smart plug auto-sensing. | **Backlog (Spec in Section 4)** |

---
