---
type: "query"
date: "2026-08-25T20:35:18.202492+00:00"
question: "Why does Member connect Core Database Models & Chore Service to Backend API Routers & Alembic Environment, Household Creation & Join Tests, Member Admin & Permissions Tests, and Web Push Subscriptions & Notification Service?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Member", "Household", "ChoreAssignment", "PushSubscription"]
---

# Q: Why does Member connect Core Database Models & Chore Service to Backend API Routers & Alembic Environment, Household Creation & Join Tests, Member Admin & Permissions Tests, and Web Push Subscriptions & Notification Service?

## Answer

Expanded from original query via vocab: ['member', 'household', 'chore', 'service', 'admin', 'push', 'subscription', 'notification', 'database', 'models', 'auth']. Then traversed Member node across communities: Member (backend/app/models.py:L74) is the central authenticated actor identity across the application, acting as a bridge between data models, chore assignments, security/auth dependencies, router endpoints, administrative permission tests, and web push subscriptions.

## Outcome

- Signal: useful

## Source Nodes

- Member
- Household
- ChoreAssignment
- PushSubscription