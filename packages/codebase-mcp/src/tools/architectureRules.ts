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
  'architecture': /Architecture Rules|Non-Negotiable/i,
  'tick-pipe': /Tick Pipe|System Order/i,
  'tech-stack': /Tech Stack/i,
  'git-workflow': /Git Workflow/i,
  'testing': /Testing Standards/i,
  'done-criteria': /What "Done" Means/i,
  'balance-rules': /Balance Constants/i,
};

const inputSchema = z.object({
  section: z
    .enum(['all', 'architecture', 'tick-pipe', 'tech-stack', 'git-workflow', 'testing', 'done-criteria', 'balance-rules'])
    .default('all')
    .describe('Which section to return. "all" returns the full CLAUDE.md.'),
});

export const architectureRules = {
  name: 'architecture_rules',
  description:
    'Returns non-negotiable architecture rules, tick pipe order, tech stack, git workflow, testing standards, and done criteria from CLAUDE.md. Query a specific section or get everything.',
  inputSchema: { section: inputSchema.shape.section },
  handler: async (args: z.infer<typeof inputSchema>) => {
    let claudeMd: string;
    try {
      claudeMd = await readFile(CLAUDE_MD_PATH, 'utf-8');
    } catch (err) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: 'Could not read CLAUDE.md', path: CLAUDE_MD_PATH, detail: String(err) }, null, 2),
        }],
      };
    }

    if (args.section === 'all') {
      return {
        content: [{ type: 'text' as const, text: claudeMd }],
      };
    }

    const pattern = SECTIONS[args.section];
    if (!pattern) {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: `Unknown section: ${args.section}` }) }],
      };
    }

    const lines = claudeMd.split('\n');
    const startIdx = lines.findIndex((line) => pattern.test(line));
    if (startIdx === -1) {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: `Section "${args.section}" not found in CLAUDE.md` }) }],
      };
    }

    // Find the next section header (line that starts the next major section)
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      // Match markdown-style headers or the all-caps section headers used in CLAUDE.md
      if (/^#{1,2}\s/.test(lines[i] ?? '') || (/^[A-Z][A-Za-z ]+$/.test(lines[i] ?? '') && (lines[i] ?? '').length > 3 && i > startIdx + 1)) {
        // Check if this line matches a DIFFERENT section
        const matchesOtherSection = Object.entries(SECTIONS).some(
          ([key, re]) => key !== args.section && re.test(lines[i] ?? ''),
        );
        if (matchesOtherSection) {
          endIdx = i;
          break;
        }
      }
    }

    const sectionText = lines.slice(startIdx, endIdx).join('\n').trim();
    return {
      content: [{ type: 'text' as const, text: sectionText }],
    };
  },
};
