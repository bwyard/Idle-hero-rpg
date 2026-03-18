import { describe, it, expect } from 'vitest';
import { LEGACY_SKILL_TEMPLATES } from '../legacySkillTemplates';

describe('LEGACY_SKILL_TEMPLATES', () => {
  it('contains at least 5 entries', () => {
    expect(Object.keys(LEGACY_SKILL_TEMPLATES).length).toBeGreaterThanOrEqual(5);
  });

  it('each skill has a non-empty id, displayName, and description', () => {
    for (const skill of Object.values(LEGACY_SKILL_TEMPLATES)) {
      expect(skill.id.length).toBeGreaterThan(0);
      expect(skill.displayName.length).toBeGreaterThan(0);
      expect(skill.description.length).toBeGreaterThan(0);
    }
  });

  it('each skill id matches its registry key', () => {
    for (const [key, skill] of Object.entries(LEGACY_SKILL_TEMPLATES)) {
      expect(skill.id).toBe(key);
    }
  });

  it('each skill has a valid kind (passive or active)', () => {
    for (const skill of Object.values(LEGACY_SKILL_TEMPLATES)) {
      expect(['passive', 'active']).toContain(skill.kind);
    }
  });

  it('passive skills have apCost 0', () => {
    const passives = Object.values(LEGACY_SKILL_TEMPLATES).filter((s) => s.kind === 'passive');
    for (const skill of passives) {
      expect(skill.apCost).toBe(0);
    }
  });

  it('active skills have apCost > 0', () => {
    const actives = Object.values(LEGACY_SKILL_TEMPLATES).filter((s) => s.kind === 'active');
    for (const skill of actives) {
      expect(skill.apCost).toBeGreaterThan(0);
    }
  });

  it('contains a mix of passive and active skills', () => {
    const passives = Object.values(LEGACY_SKILL_TEMPLATES).filter((s) => s.kind === 'passive');
    const actives = Object.values(LEGACY_SKILL_TEMPLATES).filter((s) => s.kind === 'active');
    expect(passives.length).toBeGreaterThan(0);
    expect(actives.length).toBeGreaterThan(0);
  });
});
