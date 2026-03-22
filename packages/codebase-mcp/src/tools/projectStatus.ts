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
  return todoContent.split('\n').reduce<{ blockers: string[]; inP0: boolean }>(
    (acc, line) => {
      if (line.startsWith('## P0')) return { ...acc, inP0: true };
      if (line.startsWith('## P') || line.startsWith('## Completed'))
        return { ...acc, inP0: false };
      if (acc.inP0 && line.startsWith('- [ ]')) {
        return { ...acc, blockers: [...acc.blockers, line.replace(/^- \[ \]\s*/, '').trim()] };
      }
      return acc;
    },
    { blockers: [], inP0: false },
  ).blockers;
}

function extractOpenQuestions(decisionsContent: string): string[] {
  return decisionsContent
    .split('\n')
    .reduce<{ questions: string[]; inTable: boolean; headerPassed: boolean }>(
      (acc, line) => {
        if (line.startsWith('## Open Questions')) return { ...acc, inTable: true };
        if (acc.inTable && line.startsWith('|---')) return { ...acc, headerPassed: true };
        if (acc.inTable && acc.headerPassed && line.startsWith('|')) {
          const cols = line
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean);
          if (cols.length >= 2 && !cols[1]?.toUpperCase().includes('CLOSED')) {
            return { ...acc, questions: [...acc.questions, `${cols[0] ?? ''} — ${cols[1] ?? ''}`] };
          }
        }
        if (acc.inTable && line.startsWith('---')) return { ...acc, inTable: false };
        return acc;
      },
      { questions: [], inTable: false, headerPassed: false },
    ).questions;
}

function extractRoadmapSummary(roadmapContent: string): {
  status_line: string;
  current_phase: string;
  upcoming_phases: string[];
} {
  const lines = roadmapContent.split('\n');

  const result = lines.reduce<{ statusLine: string; currentPhase: string; upcoming: string[] }>(
    (acc, line) => {
      if (line.startsWith('**Status:') || line.startsWith('Status:')) {
        return { ...acc, statusLine: line.replace(/^\*?\*?Status:\*?\*?\s*/, '').trim() };
      }
      const phaseMatch = line.match(/^##\s+(Phase\s+\d+\S*)\s*[—–-]\s*(.*)/);
      if (phaseMatch) {
        const label = `${phaseMatch[1] ?? ''}: ${(phaseMatch[2] ?? '').trim()}`;
        const idx = lines.indexOf(line);
        const nextLines = lines
          .slice(idx + 1, idx + 5)
          .join(' ')
          .toLowerCase();
        if (nextLines.includes('in progress') || nextLines.includes('in-progress')) {
          return { ...acc, currentPhase: label };
        }
        if (!nextLines.includes('complete') && !nextLines.includes('done')) {
          return { ...acc, upcoming: [...acc.upcoming, label] };
        }
      }
      return acc;
    },
    { statusLine: '', currentPhase: '', upcoming: [] },
  );

  return {
    status_line: result.statusLine || 'Unknown',
    current_phase: result.currentPhase || 'Unknown',
    upcoming_phases: result.upcoming.slice(0, 5),
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
  type Section = 'p0' | 'p1' | 'p2' | 'completed' | '';
  type TodoAcc = {
    section: Section;
    p0Count: number;
    p1Count: number;
    p2Count: number;
    completedCount: number;
    p0Items: string[];
    p1Items: string[];
  };

  const acc = todoContent.split('\n').reduce<TodoAcc>(
    (state, line) => {
      if (line.startsWith('## P0')) return { ...state, section: 'p0' };
      if (line.startsWith('## P1')) return { ...state, section: 'p1' };
      if (line.startsWith('## P2')) return { ...state, section: 'p2' };
      if (line.startsWith('## Completed')) return { ...state, section: 'completed' };
      if (line.startsWith('## ')) return { ...state, section: '' };
      if (line.startsWith('- [ ]')) {
        const text = line.replace(/^- \[ \]\s*/, '').trim();
        if (state.section === 'p0')
          return { ...state, p0Count: state.p0Count + 1, p0Items: [...state.p0Items, text] };
        if (state.section === 'p1')
          return { ...state, p1Count: state.p1Count + 1, p1Items: [...state.p1Items, text] };
        if (state.section === 'p2') return { ...state, p2Count: state.p2Count + 1 };
      }
      if (line.startsWith('- [x]')) return { ...state, completedCount: state.completedCount + 1 };
      return state;
    },
    {
      section: '',
      p0Count: 0,
      p1Count: 0,
      p2Count: 0,
      completedCount: 0,
      p0Items: [],
      p1Items: [],
    },
  );

  return {
    p0_count: acc.p0Count,
    p1_count: acc.p1Count,
    p2_count: acc.p2Count,
    completed_count: acc.completedCount,
    p0_items: acc.p0Items,
    p1_items: acc.p1Items,
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
