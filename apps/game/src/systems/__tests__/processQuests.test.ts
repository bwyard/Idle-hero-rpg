import { describe, it, expect } from 'vitest';
import { processQuests } from '../processQuests';
import { createInitialGameState } from '../../stores/initialState';
import { PLACEHOLDER_QUEST_GOLD_REWARD, PLACEHOLDER_QUEST_XP_REWARD } from '../../data/balance';
import type { GameState, Quest, Adventurer } from '@idle-hero-rpg/shared';

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'qst_test1',
    templateId: 'quest-tpl-heartlands-patrol',
    assignedAdventurerId: null,
    ticksRemaining: 30,
    isComplete: false,
    ...overrides,
  };
}

function makeAdventurer(overrides: Partial<Adventurer> = {}): Adventurer {
  return {
    id: 'adv_test1',
    name: 'TestAdv',
    tier: 'F',
    archetype: 'Fighter',
    xp: 0,
    milestones: [],
    skillBorrowUsed: false,
    recruitedYear: 0,
    retiredYear: null,
    ...overrides,
  };
}

function stateWithQuestAndAdventurer(quest: Quest, adventurer: Adventurer): GameState {
  return {
    ...createInitialGameState(),
    quests: { [quest.id]: quest },
    adventurers: { [adventurer.id]: adventurer },
  };
}

describe('processQuests', () => {
  it('decrements ticksRemaining for assigned active quests', () => {
    const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 10 });
    const adv = makeAdventurer({ id: 'adv_1' });
    const state = stateWithQuestAndAdventurer(quest, adv);

    const next = processQuests(state);
    expect(next.quests['qst_1']?.ticksRemaining).toBe(9);
  });

  it('does not decrement unassigned quests', () => {
    const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: null, ticksRemaining: 10 });
    const state: GameState = {
      ...createInitialGameState(),
      quests: { qst_1: quest },
    };

    const next = processQuests(state);
    expect(next.quests['qst_1']?.ticksRemaining).toBe(10);
  });

  it('does not decrement already-complete quests', () => {
    const quest = makeQuest({
      id: 'qst_1',
      assignedAdventurerId: 'adv_1',
      ticksRemaining: 0,
      isComplete: true,
    });
    const adv = makeAdventurer({ id: 'adv_1' });
    const state = stateWithQuestAndAdventurer(quest, adv);

    const next = processQuests(state);
    expect(next.quests['qst_1']?.ticksRemaining).toBe(0);
  });

  describe('quest completion', () => {
    it('marks quest as complete when ticksRemaining reaches 0', () => {
      const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 1 });
      const adv = makeAdventurer({ id: 'adv_1' });
      const state = stateWithQuestAndAdventurer(quest, adv);

      const next = processQuests(state);
      expect(next.quests['qst_1']?.isComplete).toBe(true);
      expect(next.quests['qst_1']?.assignedAdventurerId).toBeNull();
    });

    it('awards gold to the guild on completion', () => {
      const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 1 });
      const adv = makeAdventurer({ id: 'adv_1' });
      const state = stateWithQuestAndAdventurer(quest, adv);
      const startGold = state.guild.gold;

      const next = processQuests(state);
      expect(next.guild.gold).toBe(startGold + PLACEHOLDER_QUEST_GOLD_REWARD);
    });

    it('awards XP to the assigned adventurer on completion', () => {
      const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 1 });
      const adv = makeAdventurer({ id: 'adv_1', xp: 0 });
      const state = stateWithQuestAndAdventurer(quest, adv);

      const next = processQuests(state);
      expect(next.adventurers['adv_1']?.xp).toBe(PLACEHOLDER_QUEST_XP_REWARD);
    });

    it('emits a QUEST_COMPLETE event on completion', () => {
      const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 1 });
      const adv = makeAdventurer({ id: 'adv_1' });
      const state = stateWithQuestAndAdventurer(quest, adv);

      const next = processQuests(state);
      const completionEvents = next.pendingEvents.filter((e) => e.type === 'QUEST_COMPLETE');
      expect(completionEvents).toHaveLength(1);
    });
  });

  it('does not mutate the input state', () => {
    const quest = makeQuest({ id: 'qst_1', assignedAdventurerId: 'adv_1', ticksRemaining: 1 });
    const adv = makeAdventurer({ id: 'adv_1' });
    const state = stateWithQuestAndAdventurer(quest, adv);
    const originalTicks = state.quests['qst_1']?.ticksRemaining;

    processQuests(state);
    expect(state.quests['qst_1']?.ticksRemaining).toBe(originalTicks);
  });
});
