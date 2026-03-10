/**
 * game_state_inspector — Inspect live game state during development.
 *
 * Returns a JSON representation of the current GameState or a specific
 * sub-section of it.
 */

import { z } from 'zod';

const inputSchema = z.object({
  section: z
    .enum(['all', 'hero', 'guild', 'adventurers', 'cities', 'buildings', 'quests', 'dynasty', 'rivals', 'eventLog'])
    .optional()
    .default('all')
    .describe('Which section of the game state to inspect'),
});

export const gameStateInspector = {
  name: 'game_state_inspector',
  description: 'Inspect the current live game state. Specify a section to narrow the output.',
  inputSchema: { section: inputSchema.shape.section },
  handler: async (args: z.infer<typeof inputSchema>) => {
    // In development, game state would be loaded from MMKV or a debug endpoint.
    // This is a stub — replace with actual state loading when the game loop is wired.
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { message: 'game_state_inspector stub', requestedSection: args.section },
            null,
            2,
          ),
        },
      ],
    };
  },
};
