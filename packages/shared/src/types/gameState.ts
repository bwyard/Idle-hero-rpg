/**
 * GameState — the root save file type.
 *
 * Architecture rules:
 * - All collections are Record<string, T> keyed by ID (never arrays for lookups)
 * - Static template data is referenced by ID only — not embedded
 * - Every GameState carries a version field for migration support
 */

import type { Adventurer, TransientVisitor } from './adventurer';
import type { Building, Guild } from './guild';
import type { City, Season } from './kingdom';
import type { Quest } from './quest';
import type { Hero } from './hero';
import type { Dynasty } from './dynasty';
import type { GameEvent } from './event';

/** The complete game state stored in the save file. */
export interface GameState {
  /** Schema version — incremented with every migration. */
  readonly version: number;

  /** In-game time tracking. Ticks are the internal clock (4 per day). */
  time: {
    ticksElapsed: number;
    currentDay: number;
    currentSeason: Season;
    currentYear: number;
  };

  /** The current guild leader (founding hero or successor). */
  hero: Hero;

  /** The guild itself. */
  guild: Guild;

  /** All adventurers in the guild roster, keyed by adv_<nanoid>. */
  adventurers: Record<string, Adventurer>;

  /**
   * Non-guild adventurers currently at the guild house (dorm / transient system).
   * Keyed by vis_<nanoid>. Visitors arrive, seek a service, and leave after expiresAtTick
   * unless the player engages or holds them.
   */
  transientVisitors: Record<string, TransientVisitor>;

  /** All cities the guild has a presence in, keyed by ID. */
  cities: Record<string, City>;

  /** All buildings across all cities, keyed by ID. */
  buildings: Record<string, Building>;

  /** All active quests, keyed by ID. */
  quests: Record<string, Quest>;

  /** Dynasty meta-progression (persists across runs). */
  dynasty: Dynasty;

  /** NPC rival guilds, keyed by ID. */
  rivals: Record<string, unknown>; // TODO: Define Rival type when system is implemented

  /** The event log — chronological list of notable events. */
  eventLog: readonly GameEvent[];

  /**
   * Events generated this tick, waiting to be committed to the log.
   * Cleared by processEventLog at the end of each tick.
   */
  pendingEvents: readonly GameEvent[];

  /** Transient flags set by systems, consumed by UI or other systems. */
  flags: {
    prestigeAvailable: boolean;
  };
}
