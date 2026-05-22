/**
 * GameAction — discriminated union of all player actions.
 *
 * The dispatch function is the only entry point for player-initiated
 * state changes. Each action maps to a case in dispatch().
 */

/** Placeholder action — replaced as features are implemented. */
export interface NoOpAction {
  readonly type: 'NOOP';
}

/** Recruit a new adventurer to the guild roster. */
export interface RecruitAdventurerAction {
  readonly type: 'RECRUIT_ADVENTURER';
}

/** Construct a new building in a city. */
export interface BuildBuildingAction {
  readonly type: 'BUILD_BUILDING';
  readonly buildingTemplateId: string;
  readonly cityId: string;
}

/** Assign an existing unassigned quest to an adventurer. */
export interface StartQuestAction {
  readonly type: 'START_QUEST';
  readonly questId: string;
  readonly adventurerId: string;
}

/** Generate new quests on the quest board. */
export interface GenerateQuestsAction {
  readonly type: 'GENERATE_QUESTS';
}

/** Hold a feast — costs gold, boosts all adventurer XP. */
export interface HoldFeastAction {
  readonly type: 'HOLD_FEAST';
}

/** Put a transient visitor on hold — extends their stay with diminishing duration. */
export interface HoldVisitorAction {
  readonly type: 'HOLD_VISITOR';
  readonly visitorId: string;
}

/** Engage a transient visitor — converts them to a guild adventurer. Costs gold. */
export interface EngageVisitorAction {
  readonly type: 'ENGAGE_VISITOR';
  readonly visitorId: string;
}

/** Serve a transient visitor's request — earns serviceFee gold, visitor leaves. */
export interface ServeVisitorAction {
  readonly type: 'SERVE_VISITOR';
  readonly visitorId: string;
}

/** Dismiss a transient visitor — removes them immediately. */
export interface DismissVisitorAction {
  readonly type: 'DISMISS_VISITOR';
  readonly visitorId: string;
}

/** Approve a visitor's service request — collects serviceFee, sets heldUntilTick for service duration. */
export interface ApproveVisitorAction {
  readonly type: 'APPROVE_VISITOR';
  readonly visitorId: string;
}

/** Deny a visitor's service request — removes visitor immediately, emits a departure event. */
export interface DenyVisitorAction {
  readonly type: 'DENY_VISITOR';
  readonly visitorId: string;
}

/** Upgrade an existing building to the next level. */
export interface UpgradeBuildingAction {
  readonly type: 'UPGRADE_BUILDING';
  readonly buildingId: string;
}

/** Expand the guild to a new city. */
export interface ExpandCityAction {
  readonly type: 'EXPAND_CITY';
  readonly cityId: string;
  readonly cityName: string;
}

/**
 * Execute prestige — hand leadership to a qualified successor.
 * The successor must be a C-tier or higher adventurer in the current roster.
 * Their archetype determines the new hero class. The run resets; dynasty persists.
 */
export interface PrestigeAction {
  readonly type: 'PRESTIGE';
  readonly successorAdventurerId: string;
}

/** All possible player actions. Add new action types here as features are built. */
export type GameAction =
  | NoOpAction
  | RecruitAdventurerAction
  | BuildBuildingAction
  | StartQuestAction
  | GenerateQuestsAction
  | HoldFeastAction
  | HoldVisitorAction
  | ServeVisitorAction
  | EngageVisitorAction
  | DismissVisitorAction
  | ApproveVisitorAction
  | DenyVisitorAction
  | UpgradeBuildingAction
  | ExpandCityAction
  | PrestigeAction;
