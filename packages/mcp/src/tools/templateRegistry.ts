/**
 * template_registry — Query static data templates.
 *
 * Allows querying hero class definitions, building templates,
 * quest templates, and adventurer archetypes.
 */

import { z } from 'zod';

const inputSchema = z.object({
  type: z
    .enum(['heroClass', 'building', 'quest', 'adventurerArchetype'])
    .describe('The type of template to query'),
  id: z
    .string()
    .optional()
    .describe('Specific template ID to fetch (omit to list all of the given type)'),
});

export const templateRegistry = {
  name: 'template_registry',
  description: 'Query static data templates for heroes, buildings, quests, and archetypes.',
  inputSchema: { type: inputSchema.shape.type, id: inputSchema.shape.id },
  handler: async (args: z.infer<typeof inputSchema>) => {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { message: 'template_registry stub', type: args.type, id: args.id ?? 'all' },
            null,
            2,
          ),
        },
      ],
    };
  },
};
