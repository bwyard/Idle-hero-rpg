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
      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
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

function extractRoadmapSummary(roadmapContent: string): {
  status_line: string;
  current_phase: string;
  upcoming_phases: string[];
} {
  const lines = roadmapContent.split('\n');
  let statusLine = '';
  let currentPhase = '';
  const upcoming: string[] = [];

  for (const line of lines) {
    // Grab the **Status:** line near the top
    if (line.startsWith('**Status:') || line.startsWith('Status:')) {
      statusLine = line.replace(/^\*?\*?Status:\*?\*?\s*/, '').trim();
      continue;
    }
    // Find phase headings (## Phase N — ...) and categorize
    const phaseMatch = line.match(/^##\s+(Phase\s+\d+\S*)\s*[—–-]\s*(.*)/);
    if (phaseMatch) {
      const phaseName = phaseMatch[1] ?? '';
      const phaseDesc = (phaseMatch[2] ?? '').trim();
      const label = `${phaseName}: ${phaseDesc}`;
      // Check subsequent lines for status markers
      const idx = lines.indexOf(line);
      const nextLines = lines
        .slice(idx + 1, idx + 5)
        .join(' ')
        .toLowerCase();
      if (nextLines.includes('in progress') || nextLines.includes('in-progress')) {
        currentPhase = label;
      } else if (!nextLines.includes('complete') && !nextLines.includes('done')) {
        upcoming.push(label);
      }
    }
  }

  return {
    status_line: statusLine || 'Unknown',
    current_phase: currentPhase || 'Unknown',
    upcoming_phases: upcoming.slice(0, 5),
  };
}

function extractTodoSummary(todoContent: string): {
  p0_count: number;
  p1_count: number;
  p2_count: number;
  completed_count: number;
  p0_items: string[];
  p1_items: string[];
} {
  const lines = todoContent.split('\n');
  let currentSection = '';
  let p0Count = 0;
  let p1Count = 0;
  let p2Count = 0;
  let completedCount = 0;
  const p0Items: string[] = [];
  const p1Items: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## P0')) {
      currentSection = 'p0';
      continue;
    }
    if (line.startsWith('## P1')) {
      currentSection = 'p1';
      continue;
    }
    if (line.startsWith('## P2')) {
      currentSection = 'p2';
      continue;
    }
    if (line.startsWith('## Completed')) {
      currentSection = 'completed';
      continue;
    }
    if (line.startsWith('## ')) {
      currentSection = '';
      continue;
    }

    if (line.startsWith('- [ ]')) {
      const text = line.replace(/^- \[ \]\s*/, '').trim();
      if (currentSection === 'p0') {
        p0Count++;
        p0Items.push(text);
      } else if (currentSection === 'p1') {
        p1Count++;
        p1Items.push(text);
      } else if (currentSection === 'p2') {
        p2Count++;
      }
    }
    if (line.startsWith('- [x]')) {
      completedCount++;
    }
  }

  return {
    p0_count: p0Count,
    p1_count: p1Count,
    p2_count: p2Count,
    completed_count: completedCount,
    p0_items: p0Items,
    p1_items: p1Items,
  };
}

function extractSprintSummary(sprintContent: string): string {
  // Return first 20 non-empty lines as a compact summary
  const lines = sprintContent.split('\n').filter((l) => l.trim().length > 0);
  return lines.slice(0, 20).join('\n');
}

const inputSchema = z.object({
  section: z
    .enum(['all', 'roadmap', 'todo', 'decisions', 'sprint', 'blockers'])
    .default('blockers')
    .describe(
      'Which status view to return. "blockers" (default) gives P0 items + open questions. "all" returns summarized view of roadmap, todos, sprint, and blockers. Individual sections ("roadmap", "todo", "decisions", "sprint") return full file content.',
    ),
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

    // "all" — summarized view of everything (not raw file dumps)
    const roadmapContent = await readSafe(FILES.roadmap);
    const result = {
      p0_blockers: blockers,
      open_design_questions: openQuestions,
      roadmap: extractRoadmapSummary(roadmapContent),
      todo: extractTodoSummary(todoContent),
      sprint: extractSprintSummary(sprintContent),
    };
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
};
