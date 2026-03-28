import { describe, it, expect } from 'vitest';
import { adrLookup } from '../tools/adrLookup.js';
import { parseJsonResponse } from './helpers.js';

describe('adr_lookup', () => {
  it('lists all ADRs when no query provided', async () => {
    const result = await adrLookup.handler({});
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('count', 12);
    const adrs = parsed.adrs as { number: string }[];
    expect(adrs[0]!.number).toBe('001');
  });

  it('finds ADR by number', async () => {
    const result = await adrLookup.handler({ query: '001' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('count', 1);
    const results = parsed.results as { content: string }[];
    expect(results[0]!.content).toContain('pure function');
  });

  it('finds ADR by zero-padded number', async () => {
    const result = await adrLookup.handler({ query: '1' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('count', 1);
    const results = parsed.results as { number: string }[];
    expect(results[0]!.number).toBe('001');
  });

  it('finds ADR by keyword', async () => {
    const result = await adrLookup.handler({ query: 'mmkv' });
    const parsed = parseJsonResponse(result);
    expect(parsed.count).toBeGreaterThanOrEqual(1);
    const results = parsed.results as { title: string }[];
    expect(results[0]!.title).toContain('mmkv');
  });

  it('returns error for unknown query', async () => {
    const result = await adrLookup.handler({ query: 'nonexistent-thing-xyz' });
    const parsed = parseJsonResponse(result);
    expect(parsed.error).toContain('No ADR found');
  });
});
