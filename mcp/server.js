#!/usr/bin/env node
/**
 * MCP server per paginegiappe.it — entrypoint stdio (Claude Desktop, pacchetto npm).
 *
 * Le definizioni dei tool e i formatter vivono in tools.js, condivisi con
 * l'entrypoint hosted (netlify/functions/mcp.mjs).
 *
 * Config Claude Desktop (claude_desktop_config.json):
 *   "mcpServers": {
 *     "paginegiappe": { "command": "npx", "args": ["-y", "mcp-paginegiappe@latest"] }
 *   }
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './tools.js';

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
