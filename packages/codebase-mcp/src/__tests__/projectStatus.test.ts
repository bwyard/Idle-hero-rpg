import { describe, it, expect } from 'vitest';
import { projectStatus } from '../tools/projectStatus.js';
import { parseJsonResponse, extractText } from './helpers.js';

describe('project_status', () => {
  it('returns blockers by default', async () => {
    const result = await projectStatus.handler({ section: 'blockers' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('p0_blockers');
    expect(parsed).toHaveProperty('open_design_questions');
    expect(parsed).toHaveProperty('blocker_count');
    expect(Array.isArray(parsed.p0_blockers)).toBe(true);
  });

  it('returns roadmap content', async () => {
    const result = await projectStatus.handler({ section: 'roadmap' });
    const text = extractText(result);
    expect(text).toContain('Phase');
    expect(text).toContain('Core Loop MVP');
  });

  it('returns todo content', async () => {
    const result = await projectStatus.handler({ section: 'todo' });
    const text = extractText(result);
    expect(text).toContain('P0');
  });

  it('returns decisions content', async () => {
    const result = await projectStatus.handler({ section: 'decisions' });
    const text = extractText(result);
    expect(text).toContain('Closed Decisions');
  });

  it('returns all sections when requested', async () => {
    const result = await projectStatus.handler({ section: 'all' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('p0_blockers');
    expect(parsed).toHaveProperty('roadmap');
    expect(parsed).toHaveProperty('todo');
    expect(parsed).toHaveProperty('decisions');
  });
});
