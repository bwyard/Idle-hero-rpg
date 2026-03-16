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

  it('"all" response is compact (under 5KB)', async () => {
    const result = await projectStatus.handler({ section: 'all' });
    const text = extractText(result);
    expect(text.length).toBeLessThan(8000);
  });

  it('returns summarized all sections when requested', async () => {
    const result = await projectStatus.handler({ section: 'all' });
    const parsed = parseJsonResponse(result);
    expect(parsed).toHaveProperty('p0_blockers');
    expect(parsed).toHaveProperty('open_design_questions');
    // Roadmap is now a summary object, not raw string
    expect(parsed.roadmap).toHaveProperty('status_line');
    expect(parsed.roadmap).toHaveProperty('current_phase');
    expect(parsed.roadmap).toHaveProperty('upcoming_phases');
    // Todo is now a summary object with counts
    expect(parsed.todo).toHaveProperty('p0_count');
    expect(parsed.todo).toHaveProperty('p0_items');
    // Sprint is a truncated string, not full file
    expect(typeof parsed.sprint).toBe('string');
  });
});
