/**
 * event_log_tail — Tail the event log.
 *
 * Reads the event log from the dev fixture (packages/mcp/dev-fixtures/gameState.json)
 * and returns the N most recent events, optionally filtered by event type.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '../../dev-fixtures/gameState.json');

const inputSchema = z.object({
  count: z
    .number()
    .int()
    .positive()
    .max(500)
    .optional()
    .default(50)
    .describe('Number of recent events to return (max 500, default 50)'),
  filter: z.string().max(200).optional().describe('Optional event type filter (e.g. "PRESTIGE", "TIER_UP")'),
});

export const eventLogTail = {
  name: 'event_log_tail',
  description:
    'Tail the game event log. Returns the most recent N events from the dev fixture, optionally filtered by event type.',
  inputSchema: { count: inputSchema.shape.count, filter: inputSchema.shape.filter },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const gameEventSchema = z.object({
      id: z.string(),
      tick: z.number(),
      type: z.string(),
      message: z.string(),
      achievementKey: z.string().nullable(),
      causeId: z.string().nullable(),
    });
    const eventLogFileSchema = z.object({
      eventLog: z.array(gameEventSchema).optional(),
    }).passthrough();

    const readResult = await readFile(FIXTURE_PATH, 'utf-8')
      .then((text) => {
        const parsed: unknown = JSON.parse(text);
        const validated = eventLogFileSchema.parse(parsed);
        return { ok: true as const, events: validated.eventLog ?? [] };
      })
      .catch(() => ({ ok: false as const }));

    if (!readResult.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Could not read game state fixture',
                path: FIXTURE_PATH,
                detail: 'Failed to read fixture data',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const keyword = args.filter?.toUpperCase();
    const events = keyword
      ? readResult.events.filter((e) => e.type.toUpperCase().includes(keyword))
      : readResult.events;

    // Return the N most recent — event log is chronological, so slice from the end
    const tail = events.slice(-args.count);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { total: events.length, returned: tail.length, events: tail },
            null,
            2,
          ),
        },
      ],
    };
  },
};
