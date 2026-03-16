/**
 * adr_lookup — Query Architecture Decision Records.
 *
 * Lists all ADRs or reads a specific one by number or keyword.
 * Use this to understand the "why" behind project decisions.
 */

import { readFile, readdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADR_DIR = resolve(__dirname, '../../../../docs/adr');

interface AdrSummary {
  readonly number: string;
  readonly filename: string;
  readonly title: string;
}

async function listAdrs(): Promise<AdrSummary[]> {
  const files = await readdir(ADR_DIR);
  return files
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const match = /^(\d+)-(.+)\.md$/.exec(f);
      return {
        number: match?.[1] ?? 'unknown',
        filename: f,
        title: (match?.[2] ?? f).replace(/-/g, ' '),
      };
    });
}

const inputSchema = z.object({
  query: z
    .string()
    .optional()
    .describe('ADR number (e.g. "001", "3") or keyword (e.g. "pure functions", "mmkv"). Omit to list all ADRs.'),
});

export const adrLookup = {
  name: 'adr_lookup',
  description:
    'Query Architecture Decision Records. Pass a number to read a specific ADR, a keyword to search, or omit to list all. Returns the full ADR content.',
  inputSchema: { query: inputSchema.shape.query },
  handler: async (args: z.infer<typeof inputSchema>) => {
    let adrs: AdrSummary[];
    try {
      adrs = await listAdrs();
    } catch (err) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: 'Could not read ADR directory', path: ADR_DIR, detail: String(err) }, null, 2),
        }],
      };
    }

    const { query } = args;

    // No query — list all ADRs
    if (!query) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ count: adrs.length, adrs }, null, 2),
        }],
      };
    }

    // Try matching by number first
    const normalizedNum = query.replace(/^0+/, '');
    let matches = adrs.filter((a) => a.number.replace(/^0+/, '') === normalizedNum);

    // Fall back to keyword search across filename/title
    if (matches.length === 0) {
      const lower = query.toLowerCase();
      matches = adrs.filter(
        (a) => a.title.toLowerCase().includes(lower) || a.filename.toLowerCase().includes(lower),
      );
    }

    if (matches.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: `No ADR found matching "${query}"`, available: adrs.map((a) => `${a.number}: ${a.title}`) }, null, 2),
        }],
      };
    }

    // Read matched ADR files
    const results = await Promise.all(
      matches.map(async (adr) => {
        const content = await readFile(resolve(ADR_DIR, adr.filename), 'utf-8');
        return { number: adr.number, title: adr.title, content };
      }),
    );

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ count: results.length, results }, null, 2),
      }],
    };
  },
};
