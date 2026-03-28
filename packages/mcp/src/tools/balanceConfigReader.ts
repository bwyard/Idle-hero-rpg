/**
 * balance_config_reader — Read balance.ts constants.
 *
 * Reads apps/game/src/data/balance.ts from the filesystem and parses
 * exported constants. Supports optional keyword filtering.
 *
 * Performance:
 *   - Parsing is O(n) over file lines — unavoidable for source parsing.
 *   - Template lookup in templateRegistry is O(1) via Record key access.
 *   - No nested loops — single reduce pass over lines.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const BALANCE_PATH = resolve(__dirname, '../../../../apps/game/src/data/balance.ts');

export interface BalanceConstant {
  readonly name: string;
  readonly rawValue: string;
  readonly comment: string | null;
}

// Compiled once at module load — not re-instantiated per call.
const COMMENT_RE = /^\s*\/\*\*\s*(.+?)\s*\*\/\s*$|^\s*\/\/\s*(.+)$/;
const EXPORT_RE = /^export const (\w+)(?::\s*[^=]+)?\s*=\s*(.+?);?\s*(\/\/.*)?$/;
const INLINE_COMMENT_RE = /^\/\/\s*/;
const BLANK_OR_COMMENT_RE = /^\s*$|^\s*\/\/|^\s*\*/;

interface ParseAccum {
  pendingComment: string | null;
  constants: BalanceConstant[];
}

/**
 * Parse exported constants from balance.ts source.
 * Pure function — no side effects.
 * Single O(n) reduce pass; no nested loops.
 */
export function parseBalanceConstants(source: string): readonly BalanceConstant[] {
  const { constants } = source.split('\n').reduce<ParseAccum>(
    ({ pendingComment, constants }, line) => {
      const commentMatch = COMMENT_RE.exec(line);
      if (commentMatch) {
        return {
          pendingComment: (commentMatch[1] ?? commentMatch[2] ?? '').trim(),
          constants,
        };
      }

      const exportMatch = EXPORT_RE.exec(line);
      if (exportMatch) {
        const name = exportMatch[1] ?? '';
        const rawValue = (exportMatch[2] ?? '').replace(/;$/, '').trim();
        const inlineComment = exportMatch[3];
        const comment = inlineComment
          ? inlineComment.replace(INLINE_COMMENT_RE, '').trim()
          : pendingComment;
        return {
          pendingComment: null,
          constants: [...constants, { name, rawValue, comment }],
        };
      }

      // Non-blank, non-comment line resets the pending comment accumulator.
      return {
        pendingComment: BLANK_OR_COMMENT_RE.test(line) ? pendingComment : null,
        constants,
      };
    },
    { pendingComment: null, constants: [] },
  );

  return constants;
}

const inputSchema = z.object({
  filter: z
    .string()
    .max(200)
    .optional()
    .describe('Optional keyword filter to narrow results (e.g. "GOLD", "PRESTIGE")'),
});

export const balanceConfigReader = {
  name: 'balance_config_reader',
  description:
    'Read balance.ts constants. Returns all exported constants from the balance configuration file. Optionally filter by keyword.',
  inputSchema: { filter: inputSchema.shape.filter },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const readResult = await readFile(BALANCE_PATH, 'utf-8')
      .then((content) => ({ ok: true as const, content }))
      .catch((err: unknown) => ({ ok: false as const, err }));

    if (!readResult.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Could not read balance.ts',
                path: BALANCE_PATH,
                detail: 'Failed to read fixture data',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const source = readResult.content;

    const all = parseBalanceConstants(source);

    // O(n) keyword scan — unavoidable for unindexed search.
    const { filter } = args;
    const constants = filter
      ? all.filter((c) => c.name.toUpperCase().includes(filter.toUpperCase()))
      : all;

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ count: constants.length, constants }, null, 2),
        },
      ],
    };
  },
};
