/**
 * MCP Server — Retired Hero's Guild development tooling.
 *
 * Provides 4 tools for game state inspection and balance iteration:
 *   1. game_state_inspector  — Inspect live game state during development
 *   2. balance_config_reader — Read balance.ts constants
 *   3. template_registry     — Query static data templates
 *   4. event_log_tail        — Tail the event log
 *
 * All inputs validated with Zod.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { gameStateInspector } from './tools/gameStateInspector.js';
import { balanceConfigReader } from './tools/balanceConfigReader.js';
import { templateRegistry } from './tools/templateRegistry.js';
import { eventLogTail } from './tools/eventLogTail.js';

const server = new McpServer({
  name: 'idle-hero-rpg-mcp',
  version: '0.1.0',
});

server.registerTool(
  gameStateInspector.name,
  { description: gameStateInspector.description, inputSchema: gameStateInspector.inputSchema },
  gameStateInspector.handler,
);

server.registerTool(
  balanceConfigReader.name,
  { description: balanceConfigReader.description, inputSchema: balanceConfigReader.inputSchema },
  balanceConfigReader.handler,
);

server.registerTool(
  templateRegistry.name,
  { description: templateRegistry.description, inputSchema: templateRegistry.inputSchema },
  templateRegistry.handler,
);

server.registerTool(
  eventLogTail.name,
  { description: eventLogTail.description, inputSchema: eventLogTail.inputSchema },
  eventLogTail.handler,
);

const transport = new StdioServerTransport();
await server.connect(transport);
