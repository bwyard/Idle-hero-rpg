import { describe, it, expect } from 'vitest';
import { systemContracts } from '../tools/systemContracts.js';

function parseResult(result: { content: { type: string; text: string }[] }): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
}

describe('system_contracts', () => {
  it('lists all systems with status summary', async () => {
    const result = await systemContracts.handler({});
    const parsed = parseResult(result);
    expect(parsed).toHaveProperty('total', 12);
    expect(parsed.systems).toHaveLength(12);
    expect(parsed).toHaveProperty('live');
    expect(parsed).toHaveProperty('stubs');
    expect(parsed).toHaveProperty('withInterface');
  });

  it('looks up a specific system', async () => {
    const result = await systemContracts.handler({ system: 'processEconomy' });
    const parsed = parseResult(result);
    expect(parsed).toHaveProperty('name', 'processEconomy');
    expect(parsed).toHaveProperty('isStub');
    expect(parsed).toHaveProperty('hasInterface');
  });

  it('includes source when requested', async () => {
    const result = await systemContracts.handler({ system: 'advanceTime', include_source: true });
    const parsed = parseResult(result);
    expect(parsed).toHaveProperty('name', 'advanceTime');
    expect(parsed.source).toContain('GameState');
  });

  it('returns error for unknown system', async () => {
    const result = await systemContracts.handler({ system: 'nonexistentSystem' });
    const parsed = parseResult(result);
    expect(parsed.error).toContain('not found');
  });
});
