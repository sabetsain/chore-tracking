# Household Coordination App 🏠

A self-hosted, mobile-first progressive web application (PWA) designed for shared households and roommates to coordinate chores, track shared appliance status (Dishwasher, Washer, Dryer), handle duty rotations, and provide instant notifications without friction.

---

## ✨ Features

- **⚡ Zero-Friction Onboarding & Auth**:
  - Instant household creation with 6-character alphanumeric invite codes (`e.g., A8K2M9`).
  - Roommates join with a friendly nickname and optional 4-digit PIN. No email verification or passwords required.
  - Quick PIN login & session restoration via JWT tokens stored in localStorage.
- **🔄 Intelligent Chore Rotation & Tracking**:
  - **Weekly Round-Robin**: Automatically rotates chores among active roommates each week (anchored to Sunday).
  - **Hybrid Completion**: Single weekly chores (1-tap complete with actor credit) & continuous duty chores (multiple event logs with notes per week).
  - **"Up for Grabs" Pool**: Unassigned chores or chores from roommates marked as "Away" are pooled for anyone to claim with a single tap.
  - **1-to-1 Chore Swaps**: Trade pending chore duties with roommates seamlessly.
- **🧺 4-State Shared Appliance Tracking**:
  - Track states for Dishwasher, Washer, Dryer, and custom appliances: `empty` ➔ `dirty` ➔ `running` ➔ `clean_needs_emptying` ➔ `empty`.
  - Full audit trail logging who changed each state and when.
  - **IoT Power-Monitoring Webhooks**: Ingest smart plug power data (`power_watts`) to automatically detect cycle start (>50W) and cycle finish (<5W).
- **📡 Real-Time Live Sync & Web Push Notifications**:
  - FastAPI WebSocket manager broadcasts state changes, chore completions, and member status updates across all connected clients in real time.
  - Standards-compliant Web Push (VAPID) notifications sent when appliances finish cleaning or chores are assigned.
- **📱 PWA & Mobile First**:
  - Installable to iOS/Android home screen with service worker support, offline fallback, and touch-optimized UI built with Tailwind CSS & Lucide icons.

---

## 🚀 1-Step Self-Hosting with Docker Compose

Deploy the entire production stack (PostgreSQL 16, FastAPI backend, Nginx frontend) with a single command:

```bash
docker compose up -d
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000) (or port configured in `docker-compose.yml`)
- **Backend API & Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database**: PostgreSQL on port `5432`

To stop the containers:
```bash
docker compose down
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- PostgreSQL 16 (or local Docker container)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment & activate
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI dev server with reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run Backend Test Suite:
```bash
pytest backend/tests -v
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Run Frontend Test Suite & Production Build:
```bash
# Run Vitest test suite
npm test -- --run

# Run TypeScript type check and production build
npm run build
```

---

## 🔑 Web Push & VAPID Configuration Guide

The app uses standard Web Push with VAPID keys to send push notifications directly to browsers and mobile PWAs.

### Generating VAPID Keys

You can generate a new VAPID keypair using `pywebpush` or `web-push`:

```bash
# Using Python pywebpush in the backend virtual environment:
backend/.venv/bin/python -c "from pywebpush import webpush; from cryptography.hazmat.primitives.asymmetric import ec; from cryptography.hazmat.primitives import serialization; import base64; pk = ec.generate_private_key(ec.SECP256R1()); print('VAPID_PRIVATE_KEY=' + base64.urlsafe_b64encode(pk.private_numbers().private_value.to_bytes(32, 'big')).decode('utf-8').rstrip('=')); print('VAPID_PUBLIC_KEY=' + base64.urlsafe_b64encode(pk.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)).decode('utf-8').rstrip('='))"
```

Or using `npx web-push`:
```bash
npx web-push generate-vapid-keys
```

### Environment Variables

Set the keys in your `.env` or in `docker-compose.yml`:

```env
VAPID_PRIVATE_KEY=your_base64_encoded_private_key
VAPID_PUBLIC_KEY=your_base64_encoded_public_key
VAPID_CLAIMS_EMAIL=mailto:admin@household.local
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql+asyncpg://chores:chores_secret@localhost:5432/chores_db
```

---

## 📖 REST API & WebSocket Reference

### Authentication & Household
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/households` | Create new household (returns admin token & invite code) |
| `POST` | `/api/v1/households/join` | Join household using 6-character invite code |
| `POST` | `/api/v1/auth/login` | Login with nickname and 4-digit PIN |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated member profile |
| `PATCH` | `/api/v1/members/me/status` | Toggle status (`active` / `away`) |
| `PATCH` | `/api/v1/households/invite-code` | Regenerate household invite code (Admin only) |
| `DELETE` | `/api/v1/members/{member_id}` | Remove member from household (Admin only) |

### Chores & Duties
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/chores` | List all household chores |
| `POST` | `/api/v1/chores` | Create a new chore definition |
| `PATCH` | `/api/v1/chores/{id}` | Update chore title, weight, or active state |
| `DELETE` | `/api/v1/chores/{id}` | Delete chore definition |
| `GET` | `/api/v1/chores/assignments` | Get weekly chore assignments (auto-generates rotation) |
| `POST` | `/api/v1/chores/assignments/{id}/complete` | Mark single weekly chore completed |
| `POST` | `/api/v1/chores/assignments/{id}/log` | Log continuous duty instance (e.g. emptied trash) |
| `GET` | `/api/v1/chores/assignments/{id}/logs` | Get activity log entries for duty |
| `GET` | `/api/v1/chores/up-for-grabs` | List unassigned or away member chores |
| `POST` | `/api/v1/chores/assignments/{id}/claim` | Claim an up-for-grabs chore |
| `POST` | `/api/v1/chores/assignments/{id}/swap` | 1-to-1 swap between two pending chore assignments |

### Appliances & IoT
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/appliances` | List household appliances with current states |
| `POST` | `/api/v1/appliances` | Register custom appliance |
| `POST` | `/api/v1/appliances/{id}/state` | Transition appliance state (`empty` ➔ `dirty` ➔ `running` ➔ `clean_needs_emptying`) |
| `GET` | `/api/v1/appliances/{id}/history` | Retrieve full state change audit log |
| `POST` | `/api/v1/appliances/{id}/sensor-event` | Ingest IoT smart plug power reading (`power_watts`) |

### Web Push & WebSockets
| Protocol / Method | Endpoint | Description |
|---|---|---|
| `WS` | `/api/v1/ws/{household_id}?token={jwt}` | Real-time WebSocket connection for live event streaming |
| `GET` | `/api/v1/push/vapid-public-key` | Retrieve server's public VAPID key |
| `POST` | `/api/v1/push/subscribe` | Register browser push subscription |
| `DELETE` | `/api/v1/push/unsubscribe` | Remove browser push subscription |

#### Real-Time WebSocket Events
- `APPLIANCE_STATE_CHANGED`: Broadcast when appliance state changes (manual or IoT).
- `CHORE_UPDATED`: Broadcast on chore creation, completion, log, claim, or swap.
- `MEMBER_STATUS_CHANGED`: Broadcast when a roommate toggles active/away status.

---

## 🧪 Testing

Both backend and frontend are built strictly following Test-Driven Development (TDD):

```bash
# Backend pytest suite (97 tests covering models, CRUD, auth, rotations, push, websockets, & E2E simulation)
backend/.venv/bin/pytest backend/tests -v

# Frontend Vitest suite (47 tests covering UI components, PWA install prompt, WebSocket hook, & push subscriptions)
npm --prefix frontend test -- --run
```
