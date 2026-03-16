/**
 * project_status — Current roadmap phase, blockers, and recent decisions.
 *
 * Reads ROADMAP.md, TODO.md, and decisions.md to give a quick snapshot of
 * where the project stands and what's blocking progress.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../../');

const FILES = {
  roadmap: resolve(PROJECT_ROOT, 'docs/ROADMAP.md'),
  todo: resolve(PROJECT_ROOT, 'TODO.md'),
  decisions: resolve(PROJECT_ROOT, 'docs/decisions.md'),
  sprint: resolve(PROJECT_ROOT, 'docs/sessions/current-sprint.md'),
} as const;

function extractBlockers(todoContent: string): string[] {
  const blockers: string[] = [];
  const lines = todoContent.split('\n');
  let inP0 = false;

  for (const line of lines) {
    if (line.startsWith('## P0')) {
      inP0 = true;
      continue;
    }
    if (line.startsWith('## P') || line.startsWith('## Completed')) {
      inP0 = false;
    }
    if (inP0 && line.startsWith('- [ ]')) {
      blockers.push(line.replace(/^- \[ \]\s*/, '').trim());
    }
  }

  return blockers;
}

function extractOpenQuestions(decisionsContent: string): string[] {
  const questions: string[] = [];
  const lines = decisionsContent.split('\n');
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    if (line.startsWith('## Open Questions')) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith('|---')) {
      headerPassed = true;
      continue;
    }
    if (inTable && headerPassed && line.startsWith('|')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 2 && !cols[1]?.toUpperCase().includes('CLOSED')) {
        questions.push(`${cols[0] ?? ''} — ${cols[1] ?? ''}`);
      }
    }
    if (inTable && line.startsWith('---')) {
      inTable = false;
    }
  }

  return questions;
}

const inputSchema = z.object({
  section: z
    .enum(['all', 'roadmap', 'todo', 'decisions', 'sprint', 'blockers'])
    .default('blockers')
    .describe('Which status view to return. "blockers" gives P0 items + open questions. "all" returns everything.'),
});

export const projectStatus = {
  name: 'project_status',
  description:
    'Get current project status: roadmap phase, P0 blockers, open design questions, sprint state, and TODO items. Default view shows blockers only.',
  inputSchema: { section: inputSchema.shape.section },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const readSafe = async (path: string): Promise<string> => {
      try {
        return await readFile(path, 'utf-8');
      } catch {
        return `[Could not read: ${path}]`;
      }
    };

    const section = args.section;

    if (section === 'roadmap') {
      return { content: [{ type: 'text' as const, text: await readSafe(FILES.roadmap) }] };
    }
    if (section === 'todo') {
      return { content: [{ type: 'text' as const, text: await readSafe(FILES.todo) }] };
    }
    if (section === 'decisions') {
      return { content: [{ type: 'text' as const, text: await readSafe(FILES.decisions) }] };
    }
    if (section === 'sprint') {
      return { content: [{ type: 'text' as const, text: await readSafe(FILES.sprint) }] };
    }

    // "blockers" or "all" — aggregate view
    const [todoContent, decisionsContent, sprintContent] = await Promise.all([
      readSafe(FILES.todo),
      readSafe(FILES.decisions),
      readSafe(FILES.sprint),
    ]);

    const blockers = extractBlockers(todoContent);
    const openQuestions = extractOpenQuestions(decisionsContent);

    if (section === 'blockers') {
      const result = {
        p0_blockers: blockers,
        open_design_questions: openQuestions,
        blocker_count: blockers.length,
        question_count: openQuestions.length,
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }

    // "all" — everything
    const roadmapContent = await readSafe(FILES.roadmap);
    const result = {
      p0_blockers: blockers,
      open_design_questions: openQuestions,
      roadmap: roadmapContent,
      todo: todoContent,
      decisions: decisionsContent,
      sprint: sprintContent,
    };
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
};
