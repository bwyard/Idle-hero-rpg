import { describe, it, expect } from 'vitest';
import { eventLogTail } from '../tools/eventLogTail.js';

interface EventLogResponse {
  total: number;
  returned: number;
  events: { id: string; tick: number; type: string; message: string; achievementKey: string | null }[];
}

describe('eventLogTail handler', () => {
  it('returns events from the dev fixture', async () => {
    const result = await eventLogTail.handler({ count: 50, filter: undefined });
     
    const item = result.content[0]!;
    expect(item.type).toBe('text');
    const parsed = JSON.parse(item.text) as EventLogResponse;
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('returned');
    expect(parsed).toHaveProperty('events');
    expect(Array.isArray(parsed.events)).toBe(true);
  });

  it('each event has the required fields', async () => {
    const result = await eventLogTail.handler({ count: 50, filter: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as EventLogResponse;
    for (const event of parsed.events) {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('tick');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('message');
      expect(event).toHaveProperty('achievementKey');
    }
  });

  it('filters events by type keyword', async () => {
    const result = await eventLogTail.handler({ count: 50, filter: 'GUILD_FOUNDED' });
     
    const parsed = JSON.parse(result.content[0]!.text) as EventLogResponse;
    expect(parsed.events.every((e) => e.type.toUpperCase().includes('GUILD_FOUNDED'))).toBe(true);
  });

  it('returns empty events array when filter matches nothing', async () => {
    const result = await eventLogTail.handler({ count: 50, filter: 'NONEXISTENT_TYPE' });
     
    const parsed = JSON.parse(result.content[0]!.text) as EventLogResponse;
    expect(parsed.events).toHaveLength(0);
    expect(parsed.returned).toBe(0);
  });

  it('respects count limit', async () => {
    const result = await eventLogTail.handler({ count: 1, filter: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as EventLogResponse;
    expect(parsed.returned).toBeLessThanOrEqual(1);
  });

  it('returned count does not exceed total count', async () => {
    const result = await eventLogTail.handler({ count: 500, filter: undefined });
     
    const parsed = JSON.parse(result.content[0]!.text) as EventLogResponse;
    expect(parsed.returned).toBeLessThanOrEqual(parsed.total);
  });
});
