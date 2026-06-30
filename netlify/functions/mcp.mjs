/**
 * MCP server hosted per paginegiappe.it — endpoint remoto a https://paginegiappe.it/mcp
 *
 * Trasporto Streamable HTTP (web-standard Request/Response) in modalità stateless:
 * ogni richiesta è indipendente, ideale per il modello serverless di Netlify.
 * Nessuna autenticazione: il connettore espone solo dati pubblici in sola lettura.
 *
 * Aggiungilo come Custom Connector in Claude.ai / Claude Desktop puntando a:
 *   https://paginegiappe.it/mcp
 *
 * Le definizioni dei tool vivono in netlify/lib/mcp-tools.js.
 */

import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from '../lib/mcp-tools.mjs';

export const config = { path: '/mcp' };

export default async function handler(request) {
  // Stateless: nuovo server + transport per ogni richiesta (pattern serverless).
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}
