# ADR 007 — Google Play Integration Deferred

## Status
Accepted

## Context
Google Play achievements, leaderboards, and cloud save are desirable features for the Android release. However, integrating them before the core loop is complete would add complexity without benefit.

A Google Play Console account does not yet exist.

## Decision
Defer all Google Play SDK integration until:
1. The core game loop is complete and stable
2. A Google Play Console account is created

**From day one**, include these stubs to preserve the integration surface:
- `AchievementKey` type in `packages/shared` — covers all planned achievement triggers
- `achievementKey` field on `GameEvent` — nullable, typed as `AchievementKey | null`

These stubs add zero runtime cost and make future integration straightforward.

## Consequences
**Positive:**
- No premature dependency on Google Play SDK
- Achievement surface is typed and stubbed — integration will be mechanical
- Focus remains on core gameplay during early development

**Negative:**
- Achievement triggers must be added retroactively — requires a pass over all event emission sites when integration begins
