/**
 * event_log_tail — Tail the event log.
 *
 * Returns the N most recent events from the game event log.
 */

import { z } from 'zod';

const inputSchema = z.object({
  count: z
    .number()
    .int()
    .positive()
    .max(500)
    .optional()
    .default(50)
    .describe('Number of recent events to return (max 500, default 50)'),
  filter: z
    .string()
    .optional()
    .describe('Optional event type filter (e.g. "PRESTIGE", "TIER_UP")'),
});

export const eventLogTail = {
  name: 'event_log_tail',
  description: 'Tail the game event log. Returns the most recent N events, optionally filtered by type.',
  inputSchema: { count: inputSchema.shape.count, filter: inputSchema.shape.filter },
  handler: async (args: z.infer<typeof inputSchema>) => {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { message: 'event_log_tail stub', count: args.count, filter: args.filter ?? 'none' },
            null,
            2,
          ),
        },
      ],
    };
  },
};
