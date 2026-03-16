/**
 * Test helpers for MCP handler responses.
 *
 * MCP handlers return { content: [{ type: 'text', text: string }] }.
 * JSON.parse returns `any`, which violates strict TypeScript linting.
 * This helper provides a single typed extraction point.
 */

interface McpResponse {
  content: { type: string; text: string }[];
}

/**
 * Extract and parse the JSON text from an MCP handler response.
 * Returns Record<string, unknown> — callers narrow with their own types.
 * Centralises the single JSON.parse cast so `any` never leaks into test code.
 */
export function parseJsonResponse(response: McpResponse): Record<string, unknown> {
  const text = response.content[0]?.text ?? '{}';
  return JSON.parse(text) as Record<string, unknown>;
}

/**
 * Extract the raw text from an MCP handler response (for non-JSON responses).
 */
export function extractText(response: McpResponse): string {
  return response.content[0]?.text ?? '';
}
