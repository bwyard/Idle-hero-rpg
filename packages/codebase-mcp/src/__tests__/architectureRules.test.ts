import { describe, it, expect } from 'vitest';
import { architectureRules } from '../tools/architectureRules.js';

describe('architecture_rules', () => {
  it('returns full CLAUDE.md when section is "all"', async () => {
    const result = await architectureRules.handler({ section: 'all' });
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('Retired Hero');
    expect(text).toContain('Pure Functional Engine');
  });

  it('returns tick pipe section', async () => {
    const result = await architectureRules.handler({ section: 'tick-pipe' });
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('advanceTime');
    expect(text).toContain('processEventLog');
  });

  it('returns architecture section', async () => {
    const result = await architectureRules.handler({ section: 'architecture' });
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('pure function');
  });

  it('returns git workflow section', async () => {
    const result = await architectureRules.handler({ section: 'git-workflow' });
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('develop');
    expect(text).toContain('main');
  });

  it('returns testing section', async () => {
    const result = await architectureRules.handler({ section: 'testing' });
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('test');
  });
});
