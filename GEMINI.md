# Agent Instructions

## 1. Project Context & Handoff
When starting a session on this repository, please check the `~/.gemini/handoffs` (`.gemini/handoffs`) directory for project handoffs (such as `~/.gemini/handoffs/household-coordination-handoff.md`) instead of `/tmp` to understand the current architecture, completed MVP capabilities, conventions, and upcoming roadmap.

## 2. Codebase Exploration & Navigation (Graphify)
- **Always use graphify for exploration**: Before making changes, designing new features, or tracing dependencies, query the persistent knowledge graph in `graphify-out/graph.json` using `/graphify query "<question>"`.
- Use `/graphify path "<source>" "<target>"` to trace relationships between concepts or architectural layers.
- Consult the graph to identify God Nodes, community boundaries, and affected test suites before modifying existing code.

## 3. Knowledge Graph Maintenance
- When extending the codebase with new features, models, endpoints, or OpenSpec specifications, run `/graphify --update` to refresh `graphify-out/graph.json`, `graph.html`, and `GRAPH_REPORT.md`.
- A git post-commit hook is installed to automatically re-extract AST relationships on each commit.

## 4. Planning & Implementation Delegation
- **Spec vs. Simple Plan Evaluation**: When approaching a proposed change or feature, explicitly consider whether it warrants a full specification (e.g., OpenSpec change) versus a lightweight implementation plan.
- **Grill-Me Alignment**: Assess whether a `/grill-me` session is required with the user prior to writing out the plan or spec to resolve ambiguities, challenge assumptions, and align on design decisions early.
- **Always delegate implementation to subagents**: Execute code changes via subagents to keep their context window free of conversational planning clutter.

## 5. Future Roadmap & Product Specifications
- Consult `ROADMAP.md` for long-term product vision, architectural specifications for future capabilities (such as the Custom Appliance Engine, E-Ink Kiosk hardware, Smart Plug power profiling, and Chore Karma economics), and upcoming roadmap priorities.
- Keep `ROADMAP.md` updated whenever new ideas, advanced feature architectures, or deferred capabilities are identified.

