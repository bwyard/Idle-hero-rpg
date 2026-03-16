import { describe, it, expect } from 'vitest';
import { gameStateInspector } from '../tools/gameStateInspector.js';
import { parseJsonResponse } from './helpers.js';

describe('gameStateInspector handler', () => {
  it('returns full state when section is "all"', async () => {
    const result = await gameStateInspector.handler({ section: 'all' });
    expect(result.content[0]!.type).toBe('text');
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('hero');
    expect(parsed).toHaveProperty('guild');
    expect(parsed).toHaveProperty('adventurers');
  });

  it('returns only the hero section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'hero' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('hero');
    expect(parsed).not.toHaveProperty('guild');
    expect(parsed).not.toHaveProperty('adventurers');
  });

  it('returns only the adventurers section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'adventurers' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('adventurers');
    expect(parsed).not.toHaveProperty('hero');
  });

  it('returns only the eventLog section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'eventLog' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('eventLog');
    expect(Array.isArray(parsed.eventLog)).toBe(true);
  });

  it('returns an object for rivals (empty in fixture)', async () => {
    const result = await gameStateInspector.handler({ section: 'rivals' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('rivals');
    expect(typeof parsed.rivals).toBe('object');
  });
});
