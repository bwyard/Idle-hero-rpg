import { describe, it, expect } from 'vitest';
import { architectureRules } from '../tools/architectureRules.js';
import { extractText } from './helpers.js';

describe('architecture_rules', () => {
  it('returns full CLAUDE.md when section is "all"', async () => {
    const result = await architectureRules.handler({ section: 'all' });
    const text = extractText(result);
    expect(text).toContain('Retired Hero');
    expect(text).toContain('Pure Functional Engine');
  });

  it('returns tick pipe section', async () => {
    const result = await architectureRules.handler({ section: 'tick-pipe' });
    const text = extractText(result);
    expect(text).toContain('advanceTime');
    expect(text).toContain('processEventLog');
  });

  it('returns architecture section', async () => {
    const result = await architectureRules.handler({ section: 'architecture' });
    const text = extractText(result);
    expect(text).toContain('pure function');
  });

  it('returns git workflow section', async () => {
    const result = await architectureRules.handler({ section: 'git-workflow' });
    const text = extractText(result);
    expect(text).toContain('develop');
    expect(text).toContain('main');
  });

  it('returns testing section', async () => {
    const result = await architectureRules.handler({ section: 'testing' });
    const text = extractText(result);
    expect(text).toContain('test');
  });
});
