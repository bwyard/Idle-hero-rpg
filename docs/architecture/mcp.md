# MCP Server Architecture

## Overview

The MCP server is a development-time tool for inspecting and tuning the game without touching source code. It is built in sprint 1-2, not deferred.

See ADR-005 for the decision record.

---

## Location

`packages/mcp/`

---

## Tools

All inputs are validated with Zod. All handlers return MCP-compatible content blocks.

| Tool | Purpose | Key Input |
|---|---|---|
| `game_state_inspector` | Inspect live game state | `section` — which slice to return |
| `balance_config_reader` | Read balance.ts constants | `filter` — optional keyword filter |
| `template_registry` | Query static data templates | `type` + optional `id` |
| `event_log_tail` | Tail the event log | `count` + optional `filter` |

---

## Current Status

All four tools are **stubs**. They return placeholder JSON until the game loop is wired and a dev-mode state bridge exists.

When to unwire stubs:
- `game_state_inspector` — when `gameStore` can be read outside the React tree (dev bridge)
- `balance_config_reader` — when the build pipeline supports dynamic import of `balance.ts`
- `template_registry` — when the static template registry is built
- `event_log_tail` — when the event log is being written by systems

---

## Design Role

MCP tools and Vitest test the **same pure functions** through different surfaces:
- Vitest = CI gates, runs on every push
- MCP = interactive iteration during development, A/B testing balance variants

The MCP server is also A/B testing infrastructure for open design decisions — multiple economy implementations can be stubbed and compared via `balance_config_reader` without touching production code.
