# ADR 008 — Custom List Virtualizer over FlashList

## Status
Accepted

## Context
The adventurer roster list can contain hundreds of entries. Without virtualization, rendering all entries at once causes frame drops on mid-range Android devices.

FlashList (by Shopify) is the common recommendation for high-performance lists in React Native. However, it introduces a Shopify dependency and has known edge-case behaviors with fixed-height items.

## Decision
Implement a **custom fixed-height virtualizer** for the adventurer roster list.

Requirements:
- Fixed item height (adventurer cards are uniform height)
- Renders only visible items + overscan buffer
- No Shopify / FlashList dependency

No other list in the game requires virtualization at launch. This decision applies only to the roster list.

## Consequences
**Positive:**
- No Shopify dependency
- Full control over render behavior
- Fixed-height constraint makes the virtualizer simple to implement and test

**Negative:**
- Custom code to maintain
- Must be updated if item heights become variable
