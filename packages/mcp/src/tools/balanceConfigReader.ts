/**
 * balance_config_reader — Read balance.ts constants.
 *
 * Returns balance constants for inspection and tuning during development.
 */

import { z } from 'zod';

const inputSchema = z.object({
  filter: z
    .string()
    .optional()
    .describe('Optional keyword filter to narrow results (e.g. "GOLD", "PRESTIGE")'),
});

export const balanceConfigReader = {
  name: 'balance_config_reader',
  description: 'Read balance.ts constants. Optionally filter by keyword.',
  inputSchema: { filter: inputSchema.shape.filter },
  handler: async (args: z.infer<typeof inputSchema>) => {
    // In development, this would dynamically import balance.ts constants.
    // Stub until the build pipeline supports dynamic imports from the app package.
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { message: 'balance_config_reader stub', filter: args.filter ?? 'none' },
            null,
            2,
          ),
        },
      ],
    };
  },
};
