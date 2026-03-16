import { describe, it, expect } from 'vitest';
import { generateQuests } from '../generateQuests';
import { createInitialGameState } from '../../stores/initialState';
import { PLACEHOLDER_MAX_QUEST_BOARD_SIZE } from '../../data/balance';
import { QUEST_TEMPLATES } from '../../data/questTemplates';
import type { GameState } from '@idle-hero-rpg/shared';

/**
 * Helper: create a state with specific cities unlocked.
 * The initial state already has Heartlands unlocked.
 */
function stateWithCities(
  regions: Array<{
    id: string;
    name: string;
    region: GameState['cities'][string]['region'];
    isUnlocked: boolean;
  }>,
): GameState {
  const base = createInitialGameState();
  const cities: GameState['cities'] = {};
  for (const city of regions) {
    cities[city.id] = city;
  }
  return { ...base, cities, quests: {} };
}

describe('generateQuests', () => {
  it('generates quests up to the board max when board is empty', () => {
    const state = createInitialGameState();
    const next = generateQuests(state);

    const unassigned = Object.values(next.quests).filter((q) => q.assignedAdventurerId === null);
    expect(unassigned.length).toBe(PLACEHOLDER_MAX_QUEST_BOARD_SIZE);
  });

  it('does not exceed the board max when some unassigned quests already exist', () => {
    const state = createInitialGameState();
    // Pre-populate 3 unassigned quests
    const quests: GameState['quests'] = {};
    for (let i = 0; i < 3; i++) {
      const id = `qst_existing_${i}`;
      quests[id] = {
        id,
        templateId: 'quest-tpl-heartlands-patrol',
        assignedAdventurerId: null,
        ticksRemaining: 30,
        isComplete: false,
      };
    }
    const stateWithQuests = { ...state, quests };
    const next = generateQuests(stateWithQuests);

    const unassigned = Object.values(next.quests).filter((q) => q.assignedAdventurerId === null);
    expect(unassigned.length).toBe(PLACEHOLDER_MAX_QUEST_BOARD_SIZE);
  });

  it('does not generate quests when board is already full', () => {
    const state = createInitialGameState();
    const quests: GameState['quests'] = {};
    for (let i = 0; i < PLACEHOLDER_MAX_QUEST_BOARD_SIZE; i++) {
      const id = `qst_full_${i}`;
      quests[id] = {
        id,
        templateId: 'quest-tpl-heartlands-patrol',
        assignedAdventurerId: null,
        ticksRemaining: 30,
        isComplete: false,
      };
    }
    const stateWithQuests = { ...state, quests };
    const next = generateQuests(stateWithQuests);

    expect(Object.keys(next.quests).length).toBe(PLACEHOLDER_MAX_QUEST_BOARD_SIZE);
  });

  it('only generates quests for unlocked city regions', () => {
    // State with only Coast unlocked
    const state = stateWithCities([
      { id: 'cty_coast', name: 'Port Town', region: 'Coast', isUnlocked: true },
    ]);

    const next = generateQuests(state);
    const generated = Object.values(next.quests);

    const coastTemplateIds = Object.values(QUEST_TEMPLATES)
      .filter((t) => t.region === 'Coast')
      .map((t) => t.id);

    for (const quest of generated) {
      expect(coastTemplateIds).toContain(quest.templateId);
    }
  });

  it('does not generate quests for locked city regions', () => {
    const state = stateWithCities([
      { id: 'cty_heartlands', name: 'Millhaven', region: 'Heartlands', isUnlocked: true },
      { id: 'cty_mountains', name: 'Rockhold', region: 'Mountains', isUnlocked: false },
    ]);

    const next = generateQuests(state);
    const generated = Object.values(next.quests);

    const mountainTemplateIds = Object.values(QUEST_TEMPLATES)
      .filter((t) => t.region === 'Mountains')
      .map((t) => t.id);

    for (const quest of generated) {
      expect(mountainTemplateIds).not.toContain(quest.templateId);
    }
  });

  it('generated quests are unassigned', () => {
    const state = createInitialGameState();
    const next = generateQuests(state);

    const newQuests = Object.values(next.quests);
    for (const quest of newQuests) {
      expect(quest.assignedAdventurerId).toBeNull();
    }
  });

  it('generated quests have valid template IDs', () => {
    const state = createInitialGameState();
    const next = generateQuests(state);

    const newQuests = Object.values(next.quests);
    for (const quest of newQuests) {
      expect(QUEST_TEMPLATES[quest.templateId]).toBeDefined();
    }
  });

  it('generated quests have unique IDs', () => {
    const state = createInitialGameState();
    const next = generateQuests(state);

    const ids = Object.keys(next.quests);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    const questsBefore = { ...state.quests };
    generateQuests(state);
    expect(state.quests).toEqual(questsBefore);
  });

  it('preserves assigned quests already on the board', () => {
    const state = createInitialGameState();
    const assignedQuest = {
      id: 'qst_assigned_1',
      templateId: 'quest-tpl-heartlands-patrol',
      assignedAdventurerId: 'adv_starter_1',
      ticksRemaining: 15,
      isComplete: false,
    };
    const stateWithAssigned = {
      ...state,
      quests: { [assignedQuest.id]: assignedQuest },
    };

    const next = generateQuests(stateWithAssigned);
    expect(next.quests[assignedQuest.id]).toEqual(assignedQuest);
  });

  it('returns state unchanged when no regions are unlocked', () => {
    const state = stateWithCities([
      { id: 'cty_locked', name: 'Locked City', region: 'Mountains', isUnlocked: false },
    ]);

    const next = generateQuests(state);
    expect(Object.keys(next.quests).length).toBe(0);
  });
});
