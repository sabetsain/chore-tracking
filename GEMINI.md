# Agent Instructions

## 1. Project Context & Handoff
When starting a session on this repository, please read the project handoff document located at `/tmp/household-coordination-handoff.md` to understand the current architecture, completed MVP capabilities, conventions, and upcoming roadmap.

## 2. Codebase Exploration & Navigation (Graphify)
- **Always use graphify for exploration**: Before making changes, designing new features, or tracing dependencies, query the persistent knowledge graph in `graphify-out/graph.json` using `/graphify query "<question>"`.
- Use `/graphify path "<source>" "<target>"` to trace relationships between concepts or architectural layers.
- Consult the graph to identify God Nodes, community boundaries, and affected test suites before modifying existing code.

## 3. Knowledge Graph Maintenance
- When extending the codebase with new features, models, endpoints, or OpenSpec specifications, run `/graphify --update` to refresh `graphify-out/graph.json`, `graph.html`, and `GRAPH_REPORT.md`.
- A git post-commit hook is installed to automatically re-extract AST relationships on each commit.

