/**
 * system_contracts — Query system interface definitions and implementation status.
 *
 * Reads systemImpls.ts to show what interfaces exist, and scans system files
 * to report which are still stubs vs live implementations.
 */

import { readFile, readdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../../');
const SYSTEM_IMPLS_PATH = resolve(PROJECT_ROOT, 'packages/shared/src/types/systemImpls.ts');
const SYSTEMS_DIR = resolve(PROJECT_ROOT, 'apps/game/src/systems');
const BALANCE_PATH = resolve(PROJECT_ROOT, 'apps/game/src/data/balance.ts');

interface SystemStatus {
  readonly name: string;
  readonly filename: string;
  readonly hasInterface: boolean;
  readonly isStub: boolean;
  readonly todoCount: number;
}

async function getSystemStatuses(): Promise<SystemStatus[]> {
  const files = await readdir(SYSTEMS_DIR);
  const systemFiles = files.filter((f) => f.endsWith('.ts') && !f.includes('__tests__'));

  let implSource = '';
  try {
    implSource = await readFile(SYSTEM_IMPLS_PATH, 'utf-8');
  } catch {
    // No impls file yet — all systems lack interfaces
  }

  return Promise.all(
    systemFiles.map(async (filename) => {
      const content = await readFile(resolve(SYSTEMS_DIR, filename), 'utf-8');
      const name = filename.replace('.ts', '');

      // Check if this system has a typed interface in systemImpls.ts
      const implName = name.charAt(0).toUpperCase() + name.slice(1);
      const hasInterface = implSource.includes(`${implName}Impl`) || implSource.includes(implName);

      // Detect stub vs live: stubs typically return state unchanged or have minimal logic
      const isStub = content.includes('return state') && content.split('\n').length < 30
        || content.includes('// stub')
        || content.includes('// TODO');

      const todoCount = (content.match(/TODO/gi) ?? []).length;

      return { name, filename, hasInterface, isStub, todoCount };
    }),
  );
}

const inputSchema = z.object({
  system: z
    .string()
    .optional()
    .describe('System name (e.g. "processEconomy", "advanceTime"). Omit to list all systems and their status.'),
  include_source: z
    .boolean()
    .optional()
    .describe('If true and a system name is provided, include the full source code.'),
});

export const systemContracts = {
  name: 'system_contracts',
  description:
    'Query system interface definitions and implementation status. Shows which systems are stubs vs live, which have typed interfaces, and TODO counts. Optionally returns full source for a specific system.',
  inputSchema: {
    system: inputSchema.shape.system,
    include_source: inputSchema.shape.include_source,
  },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const statuses = await getSystemStatuses();

    if (!args.system) {
      // Summary view
      const summary = {
        total: statuses.length,
        live: statuses.filter((s) => !s.isStub).length,
        stubs: statuses.filter((s) => s.isStub).length,
        withInterface: statuses.filter((s) => s.hasInterface).length,
        totalTodos: statuses.reduce((sum, s) => sum + s.todoCount, 0),
        systems: statuses,
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }],
      };
    }

    // Specific system lookup
    const match = statuses.find(
      (s) => s.name.toLowerCase() === args.system?.toLowerCase()
        || s.filename.toLowerCase() === args.system?.toLowerCase(),
    );

    if (!match) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: `System "${args.system}" not found`,
            available: statuses.map((s) => s.name),
          }, null, 2),
        }],
      };
    }

    const result: Record<string, unknown> = { ...match };

    if (args.include_source) {
      result.source = await readFile(resolve(SYSTEMS_DIR, match.filename), 'utf-8');
    }

    // Also grab the interface if it exists
    if (match.hasInterface) {
      try {
        const implSource = await readFile(SYSTEM_IMPLS_PATH, 'utf-8');
        result.interfaceFile = SYSTEM_IMPLS_PATH;
        result.interfaceSource = implSource;
      } catch {
        // ignore
      }
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
};
