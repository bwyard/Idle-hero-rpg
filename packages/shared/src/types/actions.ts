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

/** Dismiss a transient visitor — removes them immediately. */
export interface DismissVisitorAction {
  readonly type: 'DISMISS_VISITOR';
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
 * Trigger a prestige cycle — fired when the player confirms they want to
 * retire the current leader and begin the next run.
 * Requires flags.prestigeAvailable === true.
 */
export interface TriggerPrestigeAction {
  readonly type: 'TRIGGER_PRESTIGE';
}

/**
 * Use the hero's career milestone active ability.
 * Requires milestoneUnlocked === true and sufficient actionPoints.
 * The abilityId must match the hero's milestoneAbilityId.
 */
export interface UseHeroAbilityAction {
  readonly type: 'USE_HERO_ABILITY';
  readonly abilityId: string;
}

/**
 * Borrow a legacy skill for this Conclave cycle.
 * Requires: Master Mentor unlocked (prestige ≥ 10), sufficient AP,
 * and skillBorrowUsed === false for the targeted skill.
 */
export interface BorrowSkillAction {
  readonly type: 'BORROW_SKILL';
  readonly skillId: string;
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
  | EngageVisitorAction
  | DismissVisitorAction
  | UpgradeBuildingAction
  | ExpandCityAction
  | TriggerPrestigeAction
  | UseHeroAbilityAction
  | BorrowSkillAction;
