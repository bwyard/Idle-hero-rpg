/**
 * architecture_rules — Returns non-negotiable architecture rules and constraints.
 *
 * Reads CLAUDE.md and extracts the architecture rules, tick pipe order,
 * tech stack, and "done" criteria. Use this before writing any code to
 * ensure compliance with project constraints.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../../');
const CLAUDE_MD_PATH = resolve(PROJECT_ROOT, 'CLAUDE.md');

const SECTIONS: Record<string, RegExp> = {
  architecture: /Architecture Rules|Non-Negotiable/i,
  'tick-pipe': /Tick Pipe|System Order/i,
  'tech-stack': /Tech Stack/i,
  'git-workflow': /Git Workflow/i,
  testing: /Testing Standards/i,
  'done-criteria': /What "Done" Means/i,
  'balance-rules': /Balance Constants/i,
};

const inputSchema = z.object({
  section: z
    .enum([
      'all',
      'architecture',
      'tick-pipe',
      'tech-stack',
      'git-workflow',
      'testing',
      'done-criteria',
      'balance-rules',
    ])
    .default('all')
    .describe('Which section to return. "all" returns the full CLAUDE.md.'),
});

export const architectureRules = {
  name: 'architecture_rules',
  description:
    'Returns non-negotiable architecture rules, tick pipe order, tech stack, git workflow, testing standards, and done criteria from CLAUDE.md. Query a specific section or get everything.',
  inputSchema: { section: inputSchema.shape.section },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const readResult = await readFile(CLAUDE_MD_PATH, 'utf-8')
      .then((content) => ({ ok: true as const, content }))
      .catch((err: unknown) => ({ ok: false as const, err }));

    if (!readResult.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Could not read CLAUDE.md',
                path: CLAUDE_MD_PATH,
                detail: String(readResult.err),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const claudeMd = readResult.content;

    if (args.section === 'all') {
      return {
        content: [{ type: 'text' as const, text: claudeMd }],
      };
    }

    const pattern = SECTIONS[args.section];
    if (!pattern) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Unknown section: ${args.section}` }),
          },
        ],
      };
    }

    const lines = claudeMd.split('\n');
    const startIdx = lines.findIndex((line) => pattern.test(line));
    if (startIdx === -1) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Section "${args.section}" not found in CLAUDE.md` }),
          },
        ],
      };
    }

    // Find the next section header (line that starts the next major section)
    const relativeEndIdx = lines.slice(startIdx + 1).findIndex((line, i) => {
      const isHeader =
        /^#{1,2}\s/.test(line) || (/^[A-Z][A-Za-z ]+$/.test(line) && line.length > 3 && i > 0);
      if (!isHeader) return false;
      return Object.entries(SECTIONS).some(([key, re]) => key !== args.section && re.test(line));
    });
    const endIdx = relativeEndIdx === -1 ? lines.length : startIdx + 1 + relativeEndIdx;

    const sectionText = lines.slice(startIdx, endIdx).join('\n').trim();
    return {
      content: [{ type: 'text' as const, text: sectionText }],
    };
  },
};
