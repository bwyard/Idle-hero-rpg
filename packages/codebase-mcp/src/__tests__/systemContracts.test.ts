import { describe, it, expect } from 'vitest';
import { systemContracts } from '../tools/systemContracts.js';
import { parseJsonResponse } from './helpers.js';

describe('system_contracts', () => {
  it('lists all systems with status summary', async () => {
    const result = await systemContracts.handler({});
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('total', 14);
    expect(parsed.systems).toHaveLength(14);
    expect(parsed).toHaveProperty('live');
    expect(parsed).toHaveProperty('stubs');
    expect(parsed).toHaveProperty('withInterface');
  });

  it('looks up a specific system', async () => {
    const result = await systemContracts.handler({ system: 'processEconomy' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('name', 'processEconomy');
    expect(parsed).toHaveProperty('isStub');
    expect(parsed).toHaveProperty('hasInterface');
  });

  it('includes source when requested', async () => {
    const result = await systemContracts.handler({ system: 'advanceTime', include_source: true });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('name', 'advanceTime');
    expect(String(parsed.source)).toContain('GameState');
  });

  it('returns error for unknown system', async () => {
    const result = await systemContracts.handler({ system: 'nonexistentSystem' });
    const parsed = parseJsonResponse(result);
    expect(String(parsed.error)).toContain('not found');
  });
});
