# ADR 005 — MCP Server Built Early

## Status
Accepted

## Context
Balance tuning in idle games requires constant inspection of constants, state, and event flows. Without tooling, this means adding console.log statements and rebuilding repeatedly.

The MCP server provides a development interface that Claude Code (and future AI tooling) can use to inspect and adjust the game without touching source code.

## Decision
Build the MCP server **early** — not deferred until after core systems.

Location: `packages/mcp/`

Four initial tools:
1. `game_state_inspector` — inspect live game state
2. `balance_config_reader` — read balance.ts constants
3. `template_registry` — query static templates
4. `event_log_tail` — tail the event log

All inputs validated with **Zod** schemas.

## Consequences
**Positive:**
- Balance iteration is faster and less disruptive to source code
- MCP tools can be extended as new systems are added
- Sets a pattern for AI-assisted development on the project

**Negative:**
- MCP SDK is an additional dependency
- Tools are stubs until the game loop is fully wired — must be updated as systems are completed
