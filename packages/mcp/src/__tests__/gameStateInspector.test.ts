import { describe, it, expect } from 'vitest';
import { gameStateInspector } from '../tools/gameStateInspector.js';

describe('gameStateInspector handler', () => {
  it('returns full state when section is "all"', async () => {
    const result = await gameStateInspector.handler({ section: 'all' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = result.content[0]!;
    expect(item.type).toBe('text');
    const parsed = JSON.parse(item.text) as Record<string, unknown>;
    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('hero');
    expect(parsed).toHaveProperty('guild');
    expect(parsed).toHaveProperty('adventurers');
  });

  it('returns only the hero section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'hero' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    expect(parsed).toHaveProperty('hero');
    expect(parsed).not.toHaveProperty('guild');
    expect(parsed).not.toHaveProperty('adventurers');
  });

  it('returns only the adventurers section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'adventurers' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    expect(parsed).toHaveProperty('adventurers');
    expect(parsed).not.toHaveProperty('hero');
  });

  it('returns only the eventLog section when requested', async () => {
    const result = await gameStateInspector.handler({ section: 'eventLog' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = JSON.parse(result.content[0]!.text) as { eventLog: unknown[] };
    expect(parsed).toHaveProperty('eventLog');
    expect(Array.isArray(parsed.eventLog)).toBe(true);
  });

  it('returns an object for rivals (empty in fixture)', async () => {
    const result = await gameStateInspector.handler({ section: 'rivals' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = JSON.parse(result.content[0]!.text) as { rivals: unknown };
    expect(parsed).toHaveProperty('rivals');
    expect(typeof parsed.rivals).toBe('object');
  });
});
