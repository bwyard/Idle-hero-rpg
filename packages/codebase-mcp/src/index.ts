/**
 * Codebase Intelligence MCP Server — Idle Hero RPG
 *
 * Provides 4 tools for understanding project architecture and status:
 *   1. architecture_rules  — Non-negotiable rules from CLAUDE.md
 *   2. adr_lookup          — Query Architecture Decision Records
 *   3. system_contracts    — System interface status (stub vs live)
 *   4. project_status      — Roadmap phase, blockers, open questions
 *
 * All inputs validated with Zod.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { architectureRules } from './tools/architectureRules.js';
import { adrLookup } from './tools/adrLookup.js';
import { systemContracts } from './tools/systemContracts.js';
import { projectStatus } from './tools/projectStatus.js';

const server = new McpServer({
  name: 'idle-hero-codebase-intelligence',
  version: '0.1.0',
});

server.registerTool(
  architectureRules.name,
  { description: architectureRules.description, inputSchema: architectureRules.inputSchema },
  architectureRules.handler,
);

server.registerTool(
  adrLookup.name,
  { description: adrLookup.description, inputSchema: adrLookup.inputSchema },
  adrLookup.handler,
);

server.registerTool(
  systemContracts.name,
  { description: systemContracts.description, inputSchema: systemContracts.inputSchema },
  systemContracts.handler,
);

server.registerTool(
  projectStatus.name,
  { description: projectStatus.description, inputSchema: projectStatus.inputSchema },
  projectStatus.handler,
);

const transport = new StdioServerTransport();
await server.connect(transport);
