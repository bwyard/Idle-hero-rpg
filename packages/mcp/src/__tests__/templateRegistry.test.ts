import { describe, it, expect } from 'vitest';
import {
  templateRegistry,
  HERO_CLASS_TEMPLATES,
  BUILDING_TEMPLATES,
  QUEST_TEMPLATES,
  ADVENTURER_ARCHETYPE_TEMPLATES,
} from '../tools/templateRegistry.js';

interface TemplateListResponse { type: string; count: number; templates: Record<string, unknown> }
interface ErrorResponse { error: string; type: string; id: string }

describe('templateRegistry — heroClass', () => {
  it('returns all hero classes when no id provided', async () => {
    const result = await templateRegistry.handler({ type: 'heroClass', id: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as TemplateListResponse;
    expect(parsed.type).toBe('heroClass');
    expect(parsed.count).toBe(Object.keys(HERO_CLASS_TEMPLATES).length);
    expect(parsed.templates).toHaveProperty('Warblade');
    expect(parsed.templates).toHaveProperty('Archmage');
  });

  it('returns a specific hero class by id', async () => {
    const result = await templateRegistry.handler({ type: 'heroClass', id: 'Warblade' });
     
    const parsed = JSON.parse(result.content[0]!.text) as {
      id: string;
      passiveAbility: string;
      careerMilestoneActiveAbility: string;
    };
    expect(parsed.id).toBe('Warblade');
    expect(parsed).toHaveProperty('passiveAbility');
    expect(parsed).toHaveProperty('careerMilestoneActiveAbility');
  });

  it('returns error for unknown hero class id', async () => {
    const result = await templateRegistry.handler({ type: 'heroClass', id: 'Necromancer' });
     
    const parsed = JSON.parse(result.content[0]!.text) as ErrorResponse;
    expect(parsed).toHaveProperty('error');
  });

  it('all 5 hero classes are present', () => {
    const ids = Object.keys(HERO_CLASS_TEMPLATES);
    expect(ids).toContain('Warblade');
    expect(ids).toContain('Wanderer');
    expect(ids).toContain('Archmage');
    expect(ids).toContain('Diplomat');
    expect(ids).toContain('Bard');
    expect(ids).toHaveLength(5);
  });
});

describe('templateRegistry — building', () => {
  it('returns all building templates', async () => {
    const result = await templateRegistry.handler({ type: 'building', id: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as TemplateListResponse;
    expect(parsed.count).toBe(Object.keys(BUILDING_TEMPLATES).length);
    expect(parsed.templates).toHaveProperty('guild-hall');
  });

  it('returns guild-hall template by id', async () => {
    const result = await templateRegistry.handler({ type: 'building', id: 'guild-hall' });
     
    const parsed = JSON.parse(result.content[0]!.text) as { id: string; maxLevel: number };
    expect(parsed.id).toBe('guild-hall');
    expect(parsed).toHaveProperty('maxLevel');
  });
});

describe('templateRegistry — quest', () => {
  it('returns all quest templates', async () => {
    const result = await templateRegistry.handler({ type: 'quest', id: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as TemplateListResponse;
    expect(parsed.count).toBe(Object.keys(QUEST_TEMPLATES).length);
  });

  it('quest templates have required fields', () => {
    for (const [, quest] of Object.entries(QUEST_TEMPLATES)) {
      expect(quest).toHaveProperty('id');
      expect(quest).toHaveProperty('type');
      expect(quest).toHaveProperty('minAdventurerTier');
    }
  });
});

describe('templateRegistry — adventurerArchetype', () => {
  it('returns all archetypes', async () => {
    const result = await templateRegistry.handler({ type: 'adventurerArchetype', id: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as TemplateListResponse;
    expect(parsed.count).toBe(Object.keys(ADVENTURER_ARCHETYPE_TEMPLATES).length);
    expect(parsed.templates).toHaveProperty('Fighter');
    expect(parsed.templates).toHaveProperty('Generalist');
  });

  it('returns Fighter archetype by id', async () => {
    const result = await templateRegistry.handler({ type: 'adventurerArchetype', id: 'Fighter' });
     
    const parsed = JSON.parse(result.content[0]!.text) as {
      id: string;
      preferredQuestTypes: string[];
      heroClassAffinities: string[];
    };
    expect(parsed.id).toBe('Fighter');
    expect(parsed).toHaveProperty('preferredQuestTypes');
    expect(parsed).toHaveProperty('heroClassAffinities');
  });
});
