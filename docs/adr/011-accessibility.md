# ADR 011 — Accessibility Architecture

## Status
Accepted

## Context
The game targets Android primary, iOS future. Both platforms have mature
assistive technology ecosystems (TalkBack, VoiceOver) and system-level
accessibility settings (text scaling, reduce motion, high contrast). A
mobile idle game involves persistent UI, frequent state updates, and complex
information hierarchies (roster, city map, event log) — all of which require
deliberate accessibility decisions.

Accessibility must be a first-class concern, not a retrofit.

## Decision

### Engine Layer — No Changes Required
The pure functional engine has no knowledge of the UI layer. It produces
GameState. Accessibility is entirely a UI rendering concern. This is one
of the benefits of the clean separation — accessibility does not require
any changes to tick, dispatch, or system processors.

### UI Layer — Commitments

**Screen reader support (TalkBack / VoiceOver)**
- All interactive elements carry `accessibilityLabel` and `accessibilityRole`
- State changes that matter to the player (new event, prestige available,
  adventurer tier up) trigger `AccessibilityInfo.announceForAccessibility`
- The event log is the primary narrative surface — each entry must be
  accessible to screen readers without requiring visual scanning

**Touch targets**
- Minimum 44×44dp for all interactive elements (Android and iOS guideline)
- No exceptions for decorative-but-tappable elements

**Text scaling**
- No fixed pixel font sizes — use `sp` units and respect system font scale
- Layouts must not break at 200% text scale (test case, not just aspiration)
- Avoid text truncation on critical information (adventurer name, gold count)

**Reduce motion**
- Query `AccessibilityInfo.isReduceMotionEnabled` before playing any animation
- All animations have a no-motion fallback — instant state change or
  opacity transition only
- Store reduce motion preference in UI state (not persisted — re-queried on launch)

**Colour contrast**
- Minimum WCAG AA contrast ratios (4.5:1 text, 3:1 UI components)
- Tier colours (F through Legendary) must meet contrast ratios against
  both the default dark background and any high-contrast system theme
- Tier identity is never conveyed by colour alone — always paired with
  a text label or icon

**Progressive disclosure and kingdom view**
- Collapsed aggregate counts (F/D/C tier on kingdom view) must be
  accessible — screen readers announce the count, not just the visual dot
- Full detail views (city view, roster view) carry full adventurer context

### Testing
- Accessibility props are included in unit tests for UI components
  where semantics matter (role, label, state)
- Manual TalkBack verification before any PR that touches roster, city,
  or event log UI
- Expo's built-in accessibility inspector used during development

### What Is Not Decided Yet
- Specific colour palette and contrast ratios (deferred to visual design pass)
- Whether to offer an explicit in-game high-contrast mode (deferred — system
  high-contrast support covers the base case)

## Consequences

**Positive:**
- Accessibility built in from the start is significantly cheaper than retrofit
- Pure functional engine requires zero changes — UI layer owns this fully
- Reduce motion support and text scaling are largely free with correct
  React Native primitives from the beginning
- Broadens the potential player base

**Negative:**
- Every new UI component requires deliberate labelling and role assignment
- Tier colour palette must be designed with contrast ratios as a constraint,
  not an afterthought
- Animated idle elements (gold ticking up, adventurers moving) all need
  reduce-motion fallbacks from day one
