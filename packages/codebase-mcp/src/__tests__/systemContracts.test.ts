import { describe, it, expect } from 'vitest';
import { systemContracts } from '../tools/systemContracts.js';

describe('system_contracts', () => {
  it('lists all systems with status summary', async () => {
    const result = await systemContracts.handler({});
    const parsed = JSON.parse(result.content[0]?.text ?? '{}');
    expect(parsed.total).toBe(12);
    expect(parsed.systems).toHaveLength(12);
    expect(parsed).toHaveProperty('live');
    expect(parsed).toHaveProperty('stubs');
    expect(parsed).toHaveProperty('withInterface');
  });

  it('looks up a specific system', async () => {
    const result = await systemContracts.handler({ system: 'processEconomy' });
    const parsed = JSON.parse(result.content[0]?.text ?? '{}');
    expect(parsed.name).toBe('processEconomy');
    expect(parsed).toHaveProperty('isStub');
    expect(parsed).toHaveProperty('hasInterface');
  });

  it('includes source when requested', async () => {
    const result = await systemContracts.handler({ system: 'advanceTime', include_source: true });
    const parsed = JSON.parse(result.content[0]?.text ?? '{}');
    expect(parsed.name).toBe('advanceTime');
    expect(parsed.source).toContain('GameState');
  });

  it('returns error for unknown system', async () => {
    const result = await systemContracts.handler({ system: 'nonexistentSystem' });
    const parsed = JSON.parse(result.content[0]?.text ?? '{}');
    expect(parsed.error).toContain('not found');
  });
});
