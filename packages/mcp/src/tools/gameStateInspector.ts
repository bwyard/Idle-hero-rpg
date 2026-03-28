/**
 * game_state_inspector — Inspect live game state during development.
 *
 * Reads from the dev fixture file (packages/mcp/dev-fixtures/gameState.json).
 * Replace the fixture file with a real MMKV export when the game loop is wired.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '../../dev-fixtures/gameState.json');

type GameStateSection =
  | 'all'
  | 'hero'
  | 'guild'
  | 'adventurers'
  | 'cities'
  | 'buildings'
  | 'quests'
  | 'dynasty'
  | 'rivals'
  | 'eventLog';

const inputSchema = z.object({
  section: z
    .enum([
      'all',
      'hero',
      'guild',
      'adventurers',
      'cities',
      'buildings',
      'quests',
      'dynasty',
      'rivals',
      'eventLog',
    ])
    .optional()
    .default('all')
    .describe('Which section of the game state to inspect'),
});

export const gameStateInspector = {
  name: 'game_state_inspector',
  description:
    'Inspect the current game state loaded from the dev fixture. Specify a section to narrow the output.',
  inputSchema: { section: inputSchema.shape.section },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const gameStateSchema = z.record(z.string(), z.unknown());

    const readResult = await readFile(FIXTURE_PATH, 'utf-8')
      .then((text) => {
        const parsed: unknown = JSON.parse(text);
        const validated = gameStateSchema.parse(parsed);
        return { ok: true as const, state: validated };
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

    const state = readResult.state;

    const section = args.section as GameStateSection;
    const output = section === 'all' ? state : { [section]: state[section] ?? null };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(output, null, 2),
        },
      ],
    };
  },
};
